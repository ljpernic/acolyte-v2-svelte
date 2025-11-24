<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let data: PageData;
  
  // Filter state - get from server data
  let searchTerm = data.filters?.search || '';
  let statusFilter = data.filters?.statusFilter || '';
  let typeFilter = data.filters?.typeFilter || '';
  let sortBy = data.filters?.sortBy || 'createdAt';
  let sortOrder = data.filters?.sortOrder || 'desc';

  function updateURL() {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    
    const newUrl = params.toString() ? `/calls?${params.toString()}` : '/calls';
    goto(newUrl, { replaceState: true, noScroll: true });
  }

  function search() {
    updateURL();
  }

  function filterByStatus() {
    updateURL();
  }

  function filterByType() {
    updateURL();
  }

  function filterBySort() {
    updateURL();
  }
  
  function clearFilters() {
    searchTerm = '';
    statusFilter = '';
    typeFilter = '';
    sortBy = 'createdAt';
    sortOrder = 'desc';
    goto('/calls', { replaceState: true, noScroll: true });
  }

  // Delete call functionality
  let deleteConfirmId: string | null = null;
  let isDeleting = false;
  
  async function deleteCall(callId: string) {
    if (isDeleting) return;
    
    isDeleting = true;
    try {
      const response = await fetch(`/calls/${callId}/delete`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the page to show updated list
        location.reload();
      } else {
        const error = await response.json();
        alert('Failed to delete call: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to delete call: ' + error.message);
    } finally {
      isDeleting = false;
      deleteConfirmId = null;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100';
      case 'preview': return 'text-blue-700 bg-blue-100 dark:bg-blue-700 dark:text-blue-100';
      case 'inactive': return 'text-gray-700 bg-gray-200 dark:bg-gray-400';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
  
  function getEnabledFieldsCount(formFields: any) {
    if (!formFields) return 0;
    return Object.values(formFields).filter((field: any) => field?.visible).length;
  }
  
function getEnabledFieldsList(formFields: any) {
  if (!formFields) return 'None';
  
  const fieldNames = {
    piecesPerSubmission: 'Pieces limit',
    submitterName: 'Name',
    submitterTitle: 'Title',
    submitterEmail: 'Email',
    offerFeedback: 'Feedback option',
    coverLetter: 'Cover letter',
    fileUpload: 'File upload',
    wordCount: 'Word Count Limits'
  };
  
  const visibleFields = Object.entries(formFields)
    .filter(([key, field]: [string, any]) => field?.visible)
    .map(([key, field]) => fieldNames[key as keyof typeof fieldNames])
    .filter(Boolean);
  
  return visibleFields.length > 0 ? visibleFields.join(', ') : 'None';
}

</script>
<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6 dark:text-white">
    <h1 class="text-3xl font-bold">Manage Calls for Submissions</h1>
    <a 
      href="/calls/create" 
      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700"
    >
      Create New Call
    </a>
  </div>
  
<!-- Filters Section -->
<div class="mb-6 space-y-4">
  <!-- Search -->
  <div class="flex space-x-2">
    <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Search</label>
    <input
      type="text"
      placeholder="Search title or description..."
      bind:value={searchTerm}
      class="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-800 dark:placeholder-white"
      on:keydown={(e) => {
        if (e.key === 'Enter') search();
      }}
    />
    <button 
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700"
      on:click={search}
    >
      Search
    </button>
    <button
      class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
      on:click={() => {
        searchTerm = '';
        search();
      }}
    >
      Clear
    </button>  
  </div>

  <!-- Filter row -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <!-- Status Filter -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Status</label>
      <select
        bind:value={statusFilter}
        on:change={filterByStatus}
        class="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="preview">Preview</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Type Filter -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Type</label>
      <select
        bind:value={typeFilter}
        on:change={filterByType}
        class="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Types</option>
        {#each (data.callTypes || []) as type}
          <option value={type}>{type.toUpperCase()}</option>
        {/each}
      </select>
    </div>

    <!-- Sort By -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Sort By</label>
      <select
        bind:value={sortBy}
        on:change={filterBySort}
        class="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="createdAt">Created Date</option>
        <option value="title">Title</option>
        <option value="deadline">Deadline</option>
        <option value="submissionCount">Submissions</option>
        <option value="status">Status</option>
      </select>
    </div>

    <!-- Sort Order -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Order</label>
      <button
        on:click={() => {
          sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
          filterBySort();
        }}
        class="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#if sortOrder === 'desc'}
          ↓ Descending
        {:else}
          ↑ Ascending
        {/if}
      </button>
    </div>
  </div>
</div>
  
  <!-- Results count -->
  <div class="mb-4">
    <p class="text-gray-600 dark:text-white">
      Showing {data.calls.length} call{data.calls.length !== 1 ? 's' : ''}
    </p>
  </div>
 
{#if data.calls.length === 0}
  <div class="text-center py-12">
    <p class="text-gray-500 dark:text-white text-lg">No calls match your current filters.</p>
    <button
      on:click={clearFilters}
      class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
    >
      Clear Filters
    </button>
  </div>
{:else}
  <div class="grid gap-6">
    {#each data.calls as call}
        <div class="bg-white rounded-lg shadow-md border">
          <!-- Header -->
          <div class="p-6 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold mb-2 dark:text-white">{call.title}</h3>
                <div class="text-gray-600 dark:text-white mb-3 min-h-[50px] line-clamp-3 prose prose-sm max-w-none">
                  {@html call.description}
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-white">
                  <span>Created: {new Date(call.createdAt).toLocaleDateString()}</span>
                  {#if call.deadline}
                    <span>Deadline: {new Date(call.deadline).toLocaleDateString()}</span>
                  {/if}
                  <span>Submissions: {call.submissionCount}</span>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2 ml-4">
                <span class="px-3 py-1 rounded-full text-xl font-medium bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-blue-100">
                  {call.callType?.toUpperCase() || 'TYPE NOT SET'}
                </span>
                <span class="px-3 py-1 rounded-full text-lg font-medium {getStatusColor(call.status)}">
                  {call.status.toUpperCase()}
                </span>
                

                <!-- Anonymous indicator -->
                {#if call.anonymousSubmissions}
                  <span class="px-3 py-1 rounded-full text-xl font-medium bg-purple-100 text-purple-600 dark:bg-purple-600 dark:text-purple-100">
                    ANONYMOUS
                  </span>
                {:else}
                  <span></span>
                {/if}

                <!-- Edit, View, Delete links -->
                <div class="px-3 py-1 rounded flex gap-4">
                  <a 
                    href="/calls/{call.id}/edit" 
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-200 dark:md:hover:text-blue-400 text-lg font-medium"
                  >
                    Edit
                  </a>
                  <a 
                    href="/calls/{call.id}" 
                    class="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:md:hover:text-gray-400 text-lg font-medium"
                  >
                    View
                  </a>
                  <button
                    on:click={() => deleteConfirmId = call.id}
                    class="text-red-600 hover:text-red-800 dark:text-red-200 dark:md:hover:text-red-400 text-lg font-medium"
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                  {#if call.submissionCount > 0}
                    <a 
                      href="/calls/{call.id}/submissions" 
                      class="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Submissions ({call.submissionCount})
                    </a>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- Form Configuration Summary -->
          <div class="p-6 dark:bg-gray-700 dark:border-gray-600">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="text-sm text-gray-600">
                  <!-- Fields Enabled and Color Code -->
                  <div class="mb-4 text-sm text-gray-600 dark:text-white">
                    <strong>Field Status:</strong> {getEnabledFieldsCount(call.formFields)} fields enabled. 
                    <span class="inline-flex items-center gap-1 ml-2">
                      <span class="w-3 h-3 bg-green-700 rounded-full"></span> Green indicates field is required.
                    </span>
                    <span class="inline-flex items-center gap-1 ml-3">
                      <span class="w-3 h-3 bg-yellow-400 rounded-full"></span> Yellow indicates field is optional.
                    </span>
                    <span class="inline-flex items-center gap-1 ml-3">
                      <span class="w-3 h-3 bg-red-700 rounded-full"></span> Red indicates field is disabled.
                    </span>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2">
                  <!-- Pieces Per Submission -->
                  {#if call.formFields.piecesPerSubmission?.visible}
                    {#if call.formFields.piecesPerSubmission.required}
                      <span class="px-2 py-1 bg-green-100 text-green-950 text-sm rounded">
                        {#if (call.formFields.piecesPerSubmission.min || 1) === (call.formFields.piecesPerSubmission.max || 1)}
                          {call.formFields.piecesPerSubmission.max || 1} piece{(call.formFields.piecesPerSubmission.max || 1) > 1 ? 's per submission' : ' per submission'}
                        {:else}
                          {call.formFields.piecesPerSubmission.min || 1} - {call.formFields.piecesPerSubmission.max || 1} pieces per submission
                        {/if}
                      </span>
                    {:else}
                      <span class="px-2 py-1 bg-yellow-100 text-yellow-950 text-sm rounded">
                        {#if (call.formFields.piecesPerSubmission.min || 1) === (call.formFields.piecesPerSubmission.max || 1)}
                          {call.formFields.piecesPerSubmission.max || 1} piece{(call.formFields.piecesPerSubmission.max || 1) > 1 ? 's' : ''}
                        {:else}
                          {call.formFields.piecesPerSubmission.min || 1} - {call.formFields.piecesPerSubmission.max || 1} pieces
                        {/if}
                      </span>
                    {/if}
                  {:else}
                    <span class="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                      Pieces field disabled
                    </span>
                  {/if}

                    <!-- Submitter Name -->
                    {#if call.formFields.submitterName?.visible}
                      {#if call.formFields.submitterName.required}
                        <span class="px-2 py-1 bg-green-100 text-green-950 text-sm rounded">
                          {call.formFields.submitterName.allowMultiple ? 'Multiple authors' : 'Single author'}
                        </span>
                      {:else}
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-950 text-sm rounded">
                          {call.formFields.submitterName.allowMultiple ? 'Multiple authors' : 'Single author'}
                        </span>
                      {/if}
                    {:else}
                      <span class="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                        Author field disabled
                      </span>
                    {/if}

                    <!-- Submitter Title -->
                    {#if call.formFields.submitterTitle?.visible}
                      {#if call.formFields.submitterTitle.required}
                        <span class="px-2 py-1 bg-green-100 text-green-950 text-sm rounded">
                          {call.formFields.submitterTitle.allowMultiple ? 'Multiple titles' : 'Single title'}
                        </span>
                      {:else}
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-950 text-sm rounded">
                          {call.formFields.submitterTitle.allowMultiple ? 'Multiple titles' : 'Single title'}
                        </span>
                      {/if}
                    {:else}
                      <span class="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                        Title field disabled
                      </span>
                    {/if}

                    <!-- Submitter Email -->
                    {#if call.formFields.submitterEmail?.visible}
                      {#if call.formFields.submitterEmail.required}
                        <span class="px-2 py-1 bg-green-100 text-green-950 text-sm rounded">
                          Email required
                        </span>
                      {:else}
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-950 text-sm rounded">
                          Email optional
                        </span>
                      {/if}
                    {:else}
                      <span class="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                        Email field disabled
                      </span>
                    {/if}

                    <!-- Word Count -->
                    {#if call.formFields.wordCount?.visible}
                      {#if call.formFields.wordCount.required}
                        <span class="px-2 py-1 bg-green-100 text-green-950 text-sm rounded">
                          {call.formFields.wordCount.min || 0} - {call.formFields.wordCount.max || '∞'} words
                        </span>
                      {:else}
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-950 text-sm rounded">
                          Word count optional: {call.formFields.wordCount.min || 0} - {call.formFields.wordCount.max || '∞'} words
                        </span>
                      {/if}
                    {:else}
                      <span class="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                        Word count
                      </span>
                    {/if}

                    <!-- Offer Feedback -->
                    {#if call.formFields.offerFeedback?.visible}
                      {#if call.formFields.offerFeedback.required}
                        <span class="px-2 py-1 bg-green-100 text-green-950 text-sm rounded">
                          Feedback
                        </span>
                      {:else}
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-950 text-sm rounded">
                          Feedback
                        </span>
                      {/if}
                    {:else}
                      <span class="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                        Feedback
                      </span>
                    {/if}

                    <!-- Cover Letter -->
                    {#if call.formFields.coverLetter?.visible}
                      {#if call.formFields.coverLetter.required}
                        <span class="px-2 py-1 bg-green-100 text-green-950 text-sm rounded">
                          Cover letter
                        </span>
                      {:else}
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-950 text-sm rounded">
                          Cover letter
                        </span>
                      {/if}
                    {:else}
                      <span class="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                        Cover letter
                      </span>
                    {/if}

                    <!-- File Upload -->
                    {#if call.formFields.fileUpload?.visible}
                      {#if call.formFields.fileUpload.required}
                        <span class="px-2 py-1 bg-green-100 text-green-950 text-sm rounded">
                          {call.formFields.fileUpload.allowMultiple ? 'Multiple files' : 'Single file'}
                        </span>
                      {:else}
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-950 text-sm rounded">
                          {call.formFields.fileUpload.allowMultiple ? 'Multiple files' : 'Single File'}
                        </span>
                      {/if}
                    {:else}
                      <span class="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                        File upload
                      </span>
                    {/if}
                  </div>
                </div>
              </div>
              
              <!-- Quick Actions -->
              <div class="flex flex-col gap-4 ml-4">
                <div class="flex gap-4">
                  {#if call.status === 'inactive'}
                    <form method="POST" action="/calls/{call.id}/status" class="inline">
                      <input type="hidden" name="status" value="preview" />
                      <button 
                        type="submit"
                        class="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 dark:bg-blue-600 dark:text-white dark:md:hover:bg-blue-400 dark:md:hover:text-blue-800 text-lg rounded"
                      >
                        Set Preview
                      </button>
                    </form>
                    <form method="POST" action="/calls/{call.id}/status" class="inline">
                      <input type="hidden" name="status" value="active" />
                      <button 
                        type="submit"
                        class="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-900 dark:bg-green-600 dark:text-white dark:md:hover:bg-green-400 dark:md:hover:text-green-800 text-lg rounded"
                      >
                        Make Active
                      </button>
                    </form>
                  {:else if call.status === 'preview'}
                    <form method="POST" action="/calls/{call.id}/status" class="inline">
                      <input type="hidden" name="status" value="active" />
                      <button 
                        type="submit"
                        class="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-900 dark:bg-green-600 dark:text-white dark:md:hover:bg-green-400 dark:md:hover:text-green-800 text-lg rounded"
                      >
                        Make Active
                      </button>
                    </form>
                    <form method="POST" action="/calls/{call.id}/status" class="inline">
                      <input type="hidden" name="status" value="inactive" />
                      <button 
                        type="submit"
                        class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                      >
                        Deactivate
                      </button>
                    </form>
                  {:else if call.status === 'active'}
                    <form method="POST" action="/calls/{call.id}/status" class="inline">
                      <input type="hidden" name="status" value="preview" />
                      <button 
                        type="submit"
                        class="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 dark:bg-blue-600 dark:text-white dark:md:hover:bg-blue-400 dark:md:hover:text-blue-800 text-lg rounded"
                      >
                        Set Preview
                      </button>
                    </form>
                    <form method="POST" action="/calls/{call.id}/status" class="inline">
                      <input type="hidden" name="status" value="inactive" />
                      <button 
                        type="submit"
                        class="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900 dark:bg-gray-500 dark:text-white dark:md:hover:bg-gray-300 dark:md:hover:text-gray-800 text-lg rounded"
                      >
                        Deactivate
                      </button>
                    </form>
                  {/if}
                </div>
                
                {#if call.status === 'active'}
                  <a 
                    href="/submit/{call.id}" 
                    target="_blank"
                    class="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-900 dark:bg-purple-600 dark:text-white dark:md:hover:bg-purple-400 dark:md:hover:text-purple-900 text-lg rounded"                    
                  >
                    View Public Form ↗
                  </a>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  <!-- Delete Confirmation Modal -->
{#if deleteConfirmId}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md mx-4">
      <h3 class="text-lg font-semibold mb-4">Delete Call</h3>
      <p class="text-gray-600 mb-6">
        Are you sure you want to delete this call? This action cannot be undone.
        {#if data.calls.find(c => c.id === deleteConfirmId)?.submissionCount > 0}
          <span class="text-red-600 font-medium">
            This call has {data.calls.find(c => c.id === deleteConfirmId)?.submissionCount} submissions that will also be lost.
          </span>
        {/if}
      </p>
      <div class="flex justify-end gap-3">
        <button
          on:click={() => deleteConfirmId = null}
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          on:click={() => deleteCall(deleteConfirmId)}
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
{/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>