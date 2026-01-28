<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import dayjs from "dayjs";
  import customParseFormat from "dayjs/plugin/customParseFormat";
  import relativeTime from "dayjs/plugin/relativeTime";
  import "./layout.css";

  dayjs.extend(relativeTime);
  dayjs.extend(customParseFormat);

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>SOLAR to iCalendar</title>
  <meta
    name="description"
    content="This tool takes your SBU class schedule and turns it into a file you can import into Apple
    Calendar, Google Calendar, or any other calendar software."
  />
</svelte:head>
<div class="mx-auto flex max-w-xl flex-col gap-3 p-4">
  {@render children()}
</div>
