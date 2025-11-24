<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  export let form;

  let isSubmitting = false;

  function handleSubmit() {
    isSubmitting = true;
    return async ({ result, update }) => {
      isSubmitting = false;
      
      if (result.type === 'redirect') {
        // Success - redirect with success message
        await goto('/stats?passwordChanged=true');
      } else {
        await update();
      }
    };
  }
</script>

<svelte:head>
  <title>Change Password</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md mx-auto">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Change Password</h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Enter your current password and choose a new one
      </p>
    </div>

    <div class="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form method="POST" use:enhance={handleSubmit} class="space-y-6">
        
        {#if form?.message}
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p class="text-sm text-red-600 dark:text-red-400">{form.message}</p>
          </div>
        {/if}

        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Password
          </label>
          <div class="mt-1">
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter your current password"
            />
          </div>
        </div>

        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <div class="mt-1">
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minlength="6"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter your new password"
            />
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Must be at least 6 characters long</p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <div class="mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minlength="6"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Confirm your new password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>

        <div class="text-center">
          <a
            href="/stats"
            class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Dashboard
          </a>
        </div>
      </form>
    </div>
  </div>
</div>