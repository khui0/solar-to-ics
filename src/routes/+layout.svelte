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
</svelte:head>
<div class="mx-auto flex max-w-xl flex-col gap-3 p-4">
  {@render children()}
</div>
