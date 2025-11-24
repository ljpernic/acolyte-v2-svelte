<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  
  export let data: PageData;

  // Get layout data from the page store
  $: layoutData = $page.data;
  $: user = layoutData.user;
  $: permissions = layoutData.permissions;
  $: ({ canManage, canChangePermissions } = permissions || {});
  
  // Get page data
  $: ({ users } = data);

  let saving = false;

  async function updateUser(userId: string, updates: Record<string, any>) {
    saving = true;
    try {
      const response = await fetch('/stats/api/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      window.location.reload();
    } catch (error) {
      alert('Error updating user: ' + error.message);
    } finally {
      saving = false;
    }
  }
</script>

<div class="p-6">
  <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">User Statistics (as of 1 October 2025)</h1>

  <div class="overflow-x-auto">
    <table class="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Name</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Total</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Open</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Rej (1w)</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Rej (1m)</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Rej (3m)</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Rej (tot)</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Rec (1w)</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Rec (1m)</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Rec (3m)</th>
          <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Rec (tot)</th>
          {#if canManage}
            <th class="px-2 py-2 w-1/48 text-left text-gray-900 dark:text-white">Active</th>
            <th class="px-2 py-2 w-1/24 text-left text-gray-900 dark:text-white">Actions</th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each users as user}
          <tr class="border-t border-gray-300 dark:border-gray-600 {
            user.name === 'TOTALS' 
              ? 'bg-blue-300 dark:bg-blue-900 font-semibold' 
              : ''
          }">
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.name}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.totalSubmissions}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.currentlyOpen}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.rejections.lastWeek}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.rejections.lastMonth}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.rejections.last3Months}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">
              {(user.statusCounts['Rejected, First Round'] || 0) + 
               (user.statusCounts['Rejected, Second Round'] || 0) + 
               (user.statusCounts['Rejected, Third Round'] || 0) + 
               (user.statusCounts['Rejected, Anonymously'] || 0)}
            </td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.recommendations.lastWeek}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.recommendations.lastMonth}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.recommendations.last3Months}</td>
            <td class="px-2 py-2 text-gray-900 dark:text-white">{user.statusCounts['Recommended'] || 0}</td>
            {#if canManage}
              {#if user.name !== 'TOTALS' && user.role !== 'EIC'}
              <td class="px-2 py-2">
                <span class="px-2 py-1 text-xs rounded {
                  user.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }">
                  {user.active ? '✓' : '✗'}
                </span>
              </td>
              {/if}
              <td class="px-2 py-2 w-fit">
                <div class="flex gap-2 w-fit">
                  {#if user.name !== 'TOTALS' && user.role !== 'EIC'}
                    <button
                      class="px-2 py-1 text-xs rounded w-30 {
                        user.active 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } disabled:opacity-50"
                      on:click={() => updateUser(user._id, { isActive: !user.active })}
                      disabled={saving}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                  {/if}
                  {#if user.name !== 'TOTALS' && user.role !== 'EIC'}
                    {#if canChangePermissions}
                      <button
                        class="px-2 py-1 text-xs rounded w-30 text-white disabled:opacity-0 disabled:cursor-default {
                          user.userDesignee 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }"
                        on:click={() => updateUser(user._id, { 
                          userDesignee: !user.userDesignee,
                          formDesignee: !user.userDesignee 
                        })}
                        disabled={saving || !user.active}
                      >
                        {user.userDesignee ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    {/if}
                  {/if}
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>