<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  let loading = false;
  let errorMessage = '';

  export let form;
</script>

<div class="p-6 max-w-2xl mx-auto">
  <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Add New Reader</h1>

  {#if form?.message || errorMessage}
    <div class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
      {form?.message || errorMessage}
    </div>
  {/if}

  <form 
    method="POST" 
    use:enhance={() => {
      loading = true;
      errorMessage = '';
      return async ({ result, update }) => {
        loading = false;
        console.log('Form result:', result);
        
        if (result.type === 'success') {
          // Success - redirect manually
          goto('/stats?created=' + encodeURIComponent(result.data?.name || 'User'));
        } else if (result.type === 'failure') {
          errorMessage = result.data?.message || 'An error occurred';
          await update();
        } else if (result.type === 'redirect') {
          goto(result.location);
        } else {
          await update();
        }
      };
    }}
    class="space-y-6"
  >
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Full Name *
      </label>
      <input
        type="text"
        id="name"
        name="name"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        placeholder="John Doe"
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Email Address *
      </label>
      <input
        type="email"
        id="email"
        name="email"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        placeholder="john@example.com"
      />
    </div>

    <div>
      <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Role *
      </label>
      <select
        id="role"
        name="role"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        <option value="">Select a role...</option>
        <option value="EIC">Editor in Chief</option>
        <option value="assistantEditor">Assistant Editor</option>
        <option value="associateEditor">Associate Editor</option>
      </select>
    </div>

    <div>
      <label for="subRole" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Email Role (optional)
      </label>
      <input
        type="text"
        id="subRole"
        name="subRole"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        placeholder="Email signature field. Poetry Editor, Fiction Editor, Associate Editor, etc."
      />
    </div>

    <div>
    <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Temporary Password *
    </label>
    <input
        type="password"
        id="password"
        name="password"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        placeholder="Enter a temporary password"
    />
    <p class="text-sm text-gray-500 mt-1">They can change this after logging in</p>
    </div>

    <div class="flex gap-4 pt-4">
      <button
        type="submit"
        disabled={loading}
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
      >
        {loading ? 'Creating...' : 'Create Reader & Send Invitation'}
      </button>
      
      <a
        href="/stats"
        class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
      >
        Cancel
      </a>
    </div>
  </form>
</div>