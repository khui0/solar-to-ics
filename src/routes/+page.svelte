<script lang="ts">
  import { parse, type CalendarEvent } from "$lib/solar";
  import { ctrlKeyString, daysHumanReadable, getLastDay, save, toICS } from "$lib/utilities";
  import { onMount } from "svelte";

  let input: string = $state("");
  let date: string = $state(getLastDay());
  let schedule: CalendarEvent[] | null = $state(null);

  onMount(async () => {
    const initialClipboard = await navigator.clipboard.readText();
    const initialParsed = parse(initialClipboard);
    if (initialParsed !== null) {
      input = initialClipboard;
    }
  });

  $effect(() => {
    const parsed = parse(input);
    if (parsed !== null) {
      schedule = parsed.filter((item) => item.from !== "" && item.to !== "");
    } else {
      schedule = null;
    }
  });

  function download() {
    if (schedule === null) return;
    const ics = toICS(schedule, date);
    if (ics === null) {
      alert("Error generating ICS file");
      return;
    }
    save(ics);
  }
</script>

<header class="flex items-center justify-between">
  <h1 class="text-2xl font-bold">SOLAR to iCalendar</h1>
  <a
    class="link"
    href="https://github.com/khui0/solar-to-ics"
    target="_blank"
    rel="noopener noreferrer"
  >
    GitHub
  </a>
</header>
<section class="rounded-field border border-base-300 px-3 py-2">
  <h2 class="tex font-bold">What is this?</h2>
  <p class="text-sm">
    This tool takes your SBU class schedule and turns it into a file you can import into Apple
    Calendar, Google Calendar, or any other calendar software.
  </p>
</section>
<h2 class="text-xl font-bold">Getting started</h2>
<ol class="list-inside list-decimal space-y-1">
  <li>
    <a
      class="link"
      href="https://it.stonybrook.edu/services/solar"
      target="_blank"
      rel="noopener noreferrer">Open SOLAR</a
    >
    and navigate to
    <code> Manage Classes > Enrollment > My Class Schedule </code>
  </li>
  <li>Select <code>List View</code> display option</li>
  <li>Click <code>Printer Friendly Page</code> at the bottom of the page</li>
  <li>
    <kbd class="kbd">{ctrlKeyString}</kbd> + <kbd class="kbd">A</kbd> Select the entire page
  </li>
  <li><kbd class="kbd">{ctrlKeyString}</kbd> + <kbd class="kbd">C</kbd> Copy</li>
  <li>Paste into the textbox below</li>
</ol>
<textarea class="textarea resize-none" bind:value={input} placeholder="Paste your text here..."
></textarea>
{#if schedule !== null}
  <h2 class="text-xl font-bold">Does this look correct?</h2>
  <ul class="flex flex-col gap-2">
    {#each schedule as item}
      <li>
        <h3 class="font-bold">{item.name} ({item.type.toUpperCase()})</h3>
        <p>
          {daysHumanReadable(item.days)}
          {item.from} - {item.to}
        </p>
        <p>{item.location.precise} - {item.location.general}</p>
        <p>{item.instructors.join(", ")}</p>
      </li>
    {/each}
  </ul>
  <p class="text-xs text-base-content/50">
    If something looks wrong, feel free to reach out to <a
      class="link"
      href="mailto:support@kennyhui.dev">support@kennyhui.dev</a
    > with your copied text or open a pull request if you know what you're doing!
  </p>
  <h2 class="text-xl font-bold">When's the last day of classes?</h2>
  <p>
    We've filled in our best guess, but be sure to check the <a
      class="link"
      href="https://www.stonybrook.edu/commcms/registrar/calendars/academic_calendars"
      target="_blank"
      rel="noopener noreferrer"
    >
      Stony Brook University Academic Calendars
    </a> for up to date information.
  </p>
  <input class="input" type="date" bind:value={date} />
  <button class="btn" onclick={download}>Download Static iCalendar File</button>
  <section class="text-xs text-base-content/50">
    <p>
      For Apple Calendar, open the <code>.ics</code> file on your Apple device.
      <a
        class="link"
        href="https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac"
        target="_blank"
        rel="noopener noreferrer">Need more help?</a
      >
    </p>
    <p>
      For Google Calendar, <a
        class="link"
        href="https://support.google.com/calendar/answer/37118"
        target="_blank"
        rel="noopener noreferrer">learn how to import events</a
      >
    </p>
  </section>
{:else}
  <p class="text-xs text-base-content/50">
    If nothing happens, make sure you followed the above steps correctly. Feel free to reach out to <a
      class="link"
      href="mailto:support@kennyhui.dev">support@kennyhui.dev</a
    > for help.
  </p>
{/if}
