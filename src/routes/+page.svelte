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

<h1 class="text-2xl font-bold">SOLAR to iCalendar</h1>
<ol class="list-decimal pl-8">
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
<textarea class="textarea resize-none" bind:value={input}></textarea>
{#if schedule !== null}
  <h2 class="text-xl font-bold">Does this look correct?</h2>
  <ul class="flex flex-col gap-2">
    {#each schedule as item}
      <li>
        <h3 class="font-bold">{item.name} ({item.type})</h3>
        <p>
          {daysHumanReadable(item.days)}
          {item.from} - {item.to}
        </p>
        <p>{item.location.precise} - {item.location.general}</p>
      </li>
    {/each}
  </ul>
  <h2 class="text-xl font-bold">When's the last day of classes?</h2>
  <a class="link" href="https://www.stonybrook.edu/commcms/registrar/calendars/academic_calendars" target="_blank" rel="noopener noreferrer">Stony Brook University Academic Calendars</a>
  <input class="input" type="date" bind:value={date} />
  <button class="btn" onclick={download}>Download Static Calendar</button>
{/if}
