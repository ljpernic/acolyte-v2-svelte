<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { invalidate } from '$app/navigation';
  import { fly, fade } from 'svelte/transition';

  export let data;

  $: submissions = data.submissions;
  $: activeTab = data.filter ?? 'assigned';
  $: currentPage = data.page ?? 1;
  $: totalPages = data.totalPages ?? 1;
  $: searchTerm = data.searchTerm ?? '';

  const user = data.user;
  let submissions = data.submissions;
  let currentPage = data.currentPage || 1;
  let totalPages = data.totalPages || 1;

  ////// Tabs
  let activeTab: 'assigned' | 'processed' | 'unclaimed' | 'recommendedForEIC' | 'all' = data.filter ?? 'assigned';

  ////// Search
  let searchTerm = $page.url.searchParams.get('q') || '';

  ////// Track claiming submissions
  let claiming: Record<string, boolean> = {};

  // Compute visible pages (sliding window)
  $: visiblePages = (() => {
    const maxPagesToShow = 10;
    const pages: number[] = [];
    let start = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
    let end = start + maxPagesToShow - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxPagesToShow + 1, 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  ////// Toggle types
  let selectedType: string = data.typeFilter ?? 'all';

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'fiction', label: 'Fiction' },
    { value: 'poetry', label: 'Poetry' },
    { value: 'non-fiction', label: 'Non-Fiction' }
  ];

  // Filter by type
  function filterByType() {
    updateURL();
  }

  function selectType(type: string) {
    selectedType = type;
    updateURL();
  }

  function updateURL() {
    const params = new URLSearchParams();
    params.set('filter', activeTab);
    params.set('page', '1');
    if (searchTerm) params.set('q', searchTerm);
    if (selectedType !== 'all') params.set('type', selectedType);
    goto('/dashboard?' + params.toString(), { replaceState: true, noScroll: true });
  }

  ////// --- Navigation functions ---
  function switchTab(tab: typeof activeTab) {
    const params = new URLSearchParams();
    params.set('filter', tab);
    params.set('page', '1');
    if (searchTerm) params.set('q', searchTerm);
    if (selectedType !== 'all') params.set('type', selectedType);
    goto('/dashboard?' + params.toString(), { replaceState: true, noScroll: true });
  }

  function search() {
    const params = new URLSearchParams();
    params.set('filter', activeTab);
    params.set('page', '1');
    if (searchTerm) params.set('q', searchTerm);
    if (selectedType !== 'all') params.set('type', selectedType);
    goto('/dashboard?' + params.toString(), { replaceState: true, noScroll: true });
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams();
    params.set('filter', activeTab);
    params.set('page', page.toString());
    if (searchTerm) params.set('q', searchTerm);
    if (selectedType !== 'all') params.set('type', selectedType);
    goto('/dashboard?' + params.toString(), { replaceState: true, noScroll: true });
  }

  ////// --- Claim functionality ---
async function claimSubmission(subId: string) {
  if (claiming[subId]) return; // prevent double clicks
  claiming[subId] = true;

  // Optimistically remove the submission from the table
  const originalSubmissions = [...submissions];
  submissions = submissions.filter(sub => sub._id !== subId);

  try {
    const res = await fetch(`/dashboard/claim/${subId}`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    console.error(err);
    // revert to original if claim fails
    submissions = originalSubmissions;
    alert('Failed to claim submission: ' + err.message);
  } finally {
    claiming[subId] = false;
  }
}

  ////// Status display functionality, including colors
function getStatusInfo(status) {
  const statusMap = {
    'Open': { display: 'Open', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    'Rejected, First Round': { display: 'Low Rejection', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    'Rejected, Second Round': { display: 'Mid Rejection', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    'Rejected, Third Round': { display: 'High Rejection', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    'Rejected Anonymously': { display: 'Anon Rejection', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    'Withdrawn': { display: 'Withdrawn', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
    'Recommended': { display: 'Rec', color: 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-200' },
    'Recommended, High': { display: 'High Rec', color: 'bg-green-400 text-green-800 dark:bg-green-900 dark:text-green-200' },
    'Recommended, Middle': { display: 'Mid Rec', color: 'bg-green-300 text-green-800 dark:bg-green-700 dark:text-green-200' },
    'Recommended, Low': { display: 'Low Rec', color: 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-200' },
    'Accepted': { display: 'Accepted', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
  };
  return statusMap[status] || { display: status, color: 'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100' };
}

  ////// Helper functions to handle array/string fields
  function displayTitle(title: string | string[]): string {
    if (Array.isArray(title)) {
      return title.join(', ');
    }
    return title || '';
  }

  function displayName(name: string | string[]): string {
    if (Array.isArray(name)) {
      return name.join(', ');
    }
    return name || '';
  }

  function displayReader(reader: string | string[]): string {
    if (Array.isArray(reader)) {
      return reader.join(', ');
    }
    return reader || 'unassigned';
  }

</script>

<div class="p-6 bg-white dark:bg-gray-900 min-h-screen">

  <!-- Tabs -->
  <div class="flex space-x-4 mb-4">
    <button on:click={() => switchTab('assigned')} class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" class:font-bold={activeTab === 'assigned'} class:text-blue-600={activeTab === 'assigned'} class:dark:text-blue-400={activeTab === 'assigned'}>Assigned</button>
    <button on:click={() => switchTab('processed')} class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" class:font-bold={activeTab === 'processed'} class:text-blue-600={activeTab === 'processed'} class:dark:text-blue-400={activeTab === 'processed'}>Processed</button>
    <button on:click={() => switchTab('unclaimed')} class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" class:font-bold={activeTab === 'unclaimed'} class:text-blue-600={activeTab === 'unclaimed'} class:dark:text-blue-400={activeTab === 'unclaimed'}>Unclaimed</button>
    <button on:click={() => switchTab('recommendedForEIC')} class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" class:font-bold={activeTab === 'recommendedForEIC'} class:text-blue-600={activeTab === 'recommendedForEIC'} class:dark:text-blue-400={activeTab === 'recommendedForEIC'}>My Recommendations</button>
    
    <!-- Only show All tab for EIC -->
    {#if user.role === 'EIC'}
      <button on:click={() => switchTab('all')} class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" class:font-bold={activeTab === 'all'} class:text-blue-600={activeTab === 'all'} class:dark:text-blue-400={activeTab === 'all'}>All</button>
    {/if}
  </div>

  <!-- Search -->
<div class="mb-4 flex space-x-2">
  <input
    type="text"
    placeholder="Search..."
    bind:value={searchTerm}
    class="border border-gray-300 dark:border-gray-600 px-2 py-1 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded"
    on:keydown={(e) => {
      if (e.key === 'Enter') search();
    }}
  />
  <button class="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors" on:click={search}>
    Search
  </button>
  <button
    class="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
    on:click={() => {
      searchTerm = '';
      search();
    }}
  >
    Clear
  </button>  
</div>

<!-- Toggle Types -->
<div class="mb-4 flex items-center space-x-2">
  <label for="typeFilter" class="text-base font-medium text-gray-900 dark:text-white">Type:</label>
  <select 
    id="typeFilter"
    bind:value={selectedType}
    on:change={filterByType}
    class="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
  >
    <option value="all">All Types</option>
    <option value="fiction">Fiction</option>
    <option value="poetry">Poetry</option>
    <option value="non-fiction">Non-Fiction</option>
    <!-- Add more as needed -->
  </select>
</div>

  <!-- Table -->
  <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
    <thead>
      <tr class="bg-gray-200 dark:bg-gray-700 text-center">
        <th class="px-4 py-2 w-1/2 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Title</th>
        <th class="px-4 py-2 w-1/12 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Author</th>
        <th class="px-4 py-2 w-1/24 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Type</th>
        <th class="px-4 py-2 w-1/12 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Status</th>
        <th class="px-4 py-2 w- text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Subbed</th>        
      </tr>
    </thead>

    <tbody>
      {#each submissions as sub (sub._id)}
        <tr
          class="border-t border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
          on:click={() => {
            if (activeTab === 'unclaimed') {
              claimSubmission(sub._id);
            } else {
              const params = new URLSearchParams();
              params.set('filter', activeTab);
              params.set('page', currentPage.toString());
              goto(`/dashboard/${sub._id}?` + params.toString(), { replaceState: true });
            }
          }}
          transition:fly="{{ y: 10, duration: 200 }}"
        >
          <td class="px-4 py-2 truncate max-w-xs text-gray-900 dark:text-white" title={displayTitle(sub.title)}>
            {displayTitle(sub.title)}
          </td>
          <td class="px-4 py-2 truncate max-w-sm text-gray-900 dark:text-white" title={displayName(sub.name)}>
            {displayName(sub.name)}
          </td>
          <td class="text-center px-4 py-2 truncate max-w-[100px] text-gray-900 dark:text-white" title={sub.type}>{sub.type}</td>
          <td class="text-center px-4 py-2 truncate max-w-[100px] {getStatusInfo(sub.status).color}" title={sub.status}>
            {getStatusInfo(sub.status).display}
          </td>
          <td class="text-center px-4 py-2 truncate max-w-[120px] text-gray-900 dark:text-white" title={sub.status}>{sub.createdAt.slice(0,10)}</td>
        </tr>
      {/each}

      {#if submissions.length === 0}
        <tr>
          <td colspan="5" class="text-center p-4 text-gray-500 dark:text-gray-400">No submissions found.</td>
        </tr>
      {/if}
    </tbody>
  </table>

  <!-- Pagination -->
  <div class="mt-4 flex justify-center space-x-2">
    <button 
      on:click={() => goToPage(currentPage - 1)} 
      disabled={currentPage === 1}
      class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Previous
    </button>

    {#if visiblePages[0] > 1}
      <button 
        on:click={() => goToPage(1)}
        class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        1
      </button>
      {#if visiblePages[0] > 2}<span class="text-gray-500 dark:text-gray-400">…</span>{/if}
    {/if}

    {#each visiblePages as page}
      <button 
        on:click={() => goToPage(page)} 
        class="px-3 py-1 rounded transition-colors"
        class:font-bold={currentPage === page}
        class:bg-blue-500={currentPage === page}
        class:dark:bg-blue-600={currentPage === page}
        class:text-white={currentPage === page}
        class:bg-gray-200={currentPage !== page}
        class:dark:bg-gray-700={currentPage !== page}
        class:text-gray-700={currentPage !== page}
        class:dark:text-gray-300={currentPage !== page}
        class:hover:bg-gray-300={currentPage !== page}
        class:dark:hover:bg-gray-600={currentPage !== page}
      >
        {page}
      </button>
    {/each}

    {#if visiblePages[visiblePages.length - 1] < totalPages}
      {#if visiblePages[visiblePages.length - 1] < totalPages - 1}<span class="text-gray-500 dark:text-gray-400">…</span>{/if}
      <button 
        on:click={() => goToPage(totalPages)}
        class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        {totalPages}
      </button>
    {/if}

    <button 
      on:click={() => goToPage(currentPage + 1)} 
      disabled={currentPage === totalPages}
      class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Next
    </button>
  </div>
</div>
