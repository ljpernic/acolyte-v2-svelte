<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import RichTextEditor from '$lib/utils/RichTextEditor.svelte';

  let loading = false;
  let anonymousSubmissions = false;
  let description = '';

  // Simplified form field configuration
  let formFields = {
    // Combined pieces/titles configuration
    piecesPerSubmission: {
      visible: true,
      required: true,
      allowMultiple: false,      
      min: 1,
      max: 3,
      description: "Submit up to 3 pieces with titles",
    },
    submitterName: {
      visible: true,
      required: true,
      allowMultiple: false,
      min: 1,              
      max: 3,              
      description: "Author name(s)",
    },
    submitterEmail: {
      visible: true,
      required: true,
      description: "Email address",
    },
    wordCount: {
      visible: true,
      required: true,
      min: null,
      max: 6000,
      description: "Word count limits for submissions"
    },
    offerFeedback: {
      visible: true,
      required: false,
      description: "Would you like feedback on your submission?",
    },
    coverLetter: {
      visible: false,
      required: false,
      description: "Brief cover letter (optional)",
    },
    fileUpload: {
      visible: true,
      required: true,
      description: "Upload your submission files",
    }
  };

  // Auto-set single piece limits
  $: if (!formFields.piecesPerSubmission.allowMultiple) {
    formFields.piecesPerSubmission.min = 1;
    formFields.piecesPerSubmission.max = 1;
  }

  // Create derived submitterTitle config that mirrors pieces config
  $: submitterTitleConfig = {
    visible: formFields.piecesPerSubmission.visible,
    required: formFields.piecesPerSubmission.required,
    allowMultiple: formFields.piecesPerSubmission.allowMultiple,
    min: formFields.piecesPerSubmission.min,
    max: formFields.piecesPerSubmission.max,
    description: formFields.piecesPerSubmission.allowMultiple 
      ? `Title(s) for your ${formFields.piecesPerSubmission.min === formFields.piecesPerSubmission.max ? formFields.piecesPerSubmission.max : `${formFields.piecesPerSubmission.min}-${formFields.piecesPerSubmission.max}`} piece(s)`
      : "Title of your work"
  };
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-bold">Create New Call for Submissions</h1>
    <a href="/calls" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
      Back to Calls
    </a>
  </div>
  
  <form 
    method="POST" 
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'redirect') {
          goto('/calls');
        }
      };
    }}
    class="space-y-8"
  >
    <!-- Basic Call Information -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Basic Information</h2>
      
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium mb-2">Call Title *</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Fiction Submissions - Spring 2025"
          />
        </div>
        
    <div>
      <label for="callType" class="block text-sm font-medium mb-2">Call Type *</label>
      <select 
        id="callType" 
        name="callType" 
        required
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select type...</option>
        <option value="fiction">Fiction</option>
        <option value="poetry">Poetry</option>
        <option value="nonfiction">Non-Fiction</option>
      </select>
    </div>

        <div>
          <label for="description" class="block text-sm font-medium mb-2">Call Description *</label>
            <RichTextEditor 
                bind:value={description}
                placeholder="Describe what you're looking for..."
                name="description"
            />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="deadline" class="block text-sm font-medium mb-2">Submission Deadline</label>
            <input 
              type="datetime-local" 
              id="deadline" 
              name="deadline" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Leave empty for no deadline</p>
          </div>
          
          <div>
            <label for="status" class="block text-sm font-medium mb-2">Status</label>
            <select 
              id="status" 
              name="status" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="inactive">Inactive (not visible to submitters)</option>
              <option value="preview">Preview (visible but not accepting submissions)</option>
              <option value="active">Active (accepting submissions)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Anonymous Submissions Setting -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Privacy Settings</h2>
      
      <div class="flex items-start space-x-3">
        <input 
          type="checkbox" 
          id="anonymous-submissions" 
          bind:checked={anonymousSubmissions}
          class="mt-1"
        />
        <div>
          <label for="anonymous-submissions" class="font-medium">Anonymous submissions</label>
          <p class="text-sm text-gray-600 mt-1">
            When enabled, submitter names and emails are collected but hidden from readers during review. 
            You can reveal them later if needed. Useful for blind review processes.
          </p>
        </div>
      </div>
    </div>

    <!-- Form Fields Configuration -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Submission Form Configuration</h2>
      <p class="text-gray-600 mb-6">Configure which fields to show on the submission form and customize their descriptions.</p>
      
        <div class="space-y-6">

        <!-- Submitter Name -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <input 
                type="checkbox"
                checked={true}
                disabled={true}
                id="name-visible" 
                class="mr-3 text-gray-500 bg-gray-100 border-gray-300 cursor-default"
              />
              <label for="name-visible" class="font-medium">Submitter name <span class="text-gray-400">(always required)</span></label>
            </div>
            {#if formFields.submitterName.visible}
              <div class="flex items-center">
                <input 
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  id="name-required" 
                  class="mr-3 text-gray-500 bg-gray-100 border-gray-300 cursor-default"
                />
                <label for="name-required" class="text-sm text-gray-600">
                    Required
                </label>
              </div>
            {/if}
          </div>
  
        {#if formFields.submitterName.visible}
        <div class="ml-6 space-y-3">
            <div>
            <input 
                type="checkbox" 
                id="name-multiple" 
                bind:checked={formFields.submitterName.allowMultiple}
                class="mr-2"
            />
            <label for="name-multiple" class="text-sm">Allow multiple authors for a single submission</label>
            </div>
            {#if formFields.submitterName.allowMultiple}
            <div class="grid grid-cols-2 gap-4">
                <div>
                <label class="block text-sm font-medium mb-1">Minimum authors</label>
                <input 
                    type="number" 
                    bind:value={formFields.submitterName.min}
                    min="1"
                    class="w-full border border-gray-300 rounded px-3 py-2"
                />
                </div>
                <div>
                <label class="block text-sm font-medium mb-1">Maximum authors</label>
                <input 
                    type="number" 
                    bind:value={formFields.submitterName.max}
                    min="1"
                    class="w-full border border-gray-300 rounded px-3 py-2"
                />
                </div>
            </div>
            {/if}
            <div>
            <label class="block text-sm font-medium mb-1">Field description</label>
            <input 
                type="text" 
                bind:value={formFields.submitterName.description}
                class="w-full border border-gray-300 rounded px-3 py-2"
            />
            </div>
        </div>
        {/if}
      </div>

      <!-- Pieces per submission (now includes titles) -->
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <input 
              type="checkbox"
              checked={true}
              disabled={true}
              id="pieces-visible" 
              class="mr-3 text-gray-500 bg-gray-100 border-gray-300 cursor-default"
            />
            <label for="pieces-visible" class="font-medium">Pieces/Titles per submission <span class="text-gray-400">(always required)</span></label>
          </div>
          {#if formFields.piecesPerSubmission.visible}
            <div class="flex items-center">
              <input 
                type="checkbox"
                checked={true}
                disabled={true}
                id="pieces-required" 
                class="mr-3 text-gray-500 bg-gray-100 border-gray-300 cursor-default"
              />
              <label for="pieces-required" class="text-sm text-gray-600">Required</label>
            </div>
          {/if}
        </div>
  
        {#if formFields.piecesPerSubmission.visible}
          <div class="ml-6 space-y-3">
            <div>
              <input 
                type="checkbox" 
                id="pieces-multiple" 
                bind:checked={formFields.piecesPerSubmission.allowMultiple}
                class="mr-2"
              />
              <label for="pieces-multiple" class="text-sm">Allow multiple pieces with matching titles in a single submission</label>
            </div>
            {#if formFields.piecesPerSubmission.allowMultiple}
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Minimum pieces</label>
                  <input 
                    type="number" 
                    bind:value={formFields.piecesPerSubmission.min}
                    min="1"
                    class="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Maximum pieces</label>
                  <input 
                    type="number" 
                    bind:value={formFields.piecesPerSubmission.max}
                    min="1"
                    class="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
            {/if}
            <div>
              <label class="block text-sm font-medium mb-1">Field description</label>
              <input 
                type="text" 
                bind:value={formFields.piecesPerSubmission.description}
                class="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Instructions for submitters about pieces and titles"
              />
            </div>
          </div>
        {/if}
      </div>

        <!-- Submitter Email -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <input 
                type="checkbox"
                checked={true}
                disabled={true}
                id="email-visible" 
                class="mr-3 text-gray-500 bg-gray-100 border-gray-300 cursor-default"
              />
              <label for="email-visible" class="font-medium">Email address <span class="text-gray-400">(always required)</span></label>
            </div>
            {#if formFields.submitterEmail.visible}
              <div class="flex items-center">
                <input 
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  id="email-required" 
                  class="mr-3 text-gray-500 bg-gray-100 border-gray-300 cursor-default"
                />
                <label for="email-required" class="text-sm text-gray-600">
                    Required
                </label>
              </div>
            {/if}
          </div>
          
            {#if formFields.submitterEmail.visible}
            <div class="ml-6">
                <label class="block text-sm font-medium mb-1">Field description</label>
                <input 
                type="text" 
                bind:value={formFields.submitterEmail.description}
                class="w-full border border-gray-300 rounded px-3 py-2"
                />
            </div>
            {/if}
        </div>

        <!-- Word Count -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="wordcount-visible" 
                bind:checked={formFields.wordCount.visible}
                class="mr-3"
              />
              <label for="wordcount-visible" class="font-medium">Word Count</label>
            </div>
            {#if formFields.wordCount.visible}
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="wordcount-required" 
                  bind:checked={formFields.wordCount.required}
                  class="mr-2"
                />
                <label for="wordcount-required" class="text-sm text-gray-600">Required</label>
              </div>
            {/if}
          </div>
          
          {#if formFields.wordCount.visible}
            <div class="ml-6 space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Minimum words</label>
                  <input 
                    type="number" 
                    bind:value={formFields.wordCount.min}
                    min="0"
                    class="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Leave empty for no minimum"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Maximum words</label>
                  <input 
                    type="number" 
                    bind:value={formFields.wordCount.max}
                    min="1"
                    class="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Field description</label>
                <input 
                  type="text" 
                  bind:value={formFields.wordCount.description}
                  class="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Instructions about word count limits"
                />
              </div>
            </div>
          {/if}
        </div>

        <!-- Offer Feedback -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="feedback-visible" 
                bind:checked={formFields.offerFeedback.visible}
                class="mr-3"
              />
              <label for="feedback-visible" class="font-medium">Offer feedback</label>
            </div>
            {#if formFields.offerFeedback.visible}
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="feedback-required" 
                  bind:checked={formFields.offerFeedback.required}
                  class="mr-2"
                />
                <label for="feedback-required" class="text-sm text-gray-600">Required</label>
              </div>
            {/if}
          </div>
          
          {#if formFields.offerFeedback.visible}
            <div class="ml-6">
              <label class="block text-sm font-medium mb-1">Field description</label>
              <input 
                type="text" 
                bind:value={formFields.offerFeedback.description}
                class="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          {/if}
        </div>

        <!-- Cover Letter -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="cover-visible" 
                bind:checked={formFields.coverLetter.visible}
                class="mr-3"
              />
              <label for="cover-visible" class="font-medium">Cover letter</label>
            </div>
            {#if formFields.coverLetter.visible}
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="cover-required" 
                  bind:checked={formFields.coverLetter.required}
                  class="mr-2"
                />
                <label for="cover-required" class="text-sm text-gray-600">Required</label>
              </div>
            {/if}
          </div>
          
          {#if formFields.coverLetter.visible}
            <div class="ml-6">
              <label class="block text-sm font-medium mb-1">Field description</label>
              <input 
                type="text" 
                bind:value={formFields.coverLetter.description}
                class="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          {/if}
        </div>

        <!-- File Upload -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="file-visible" 
                bind:checked={formFields.fileUpload.visible}
                class="mr-3"
              />
              <label for="file-visible" class="font-medium">File upload</label>
            </div>
            {#if formFields.fileUpload.visible}
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="file-required" 
                  bind:checked={formFields.fileUpload.required}
                  class="mr-2"
                />
                <label for="file-required" class="text-sm text-gray-600">Required</label>
              </div>
            {/if}
          </div>
          
          {#if formFields.fileUpload.visible}
            <div class="ml-6">
              <label class="block text-sm font-medium mb-1">Field description</label>
              <input 
                type="text" 
                bind:value={formFields.fileUpload.description}
                class="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Hidden fields to pass data -->
    <input type="hidden" name="formFields" value={JSON.stringify(formFields)} />
    <input type="hidden" name="anonymousSubmissions" value={anonymousSubmissions} />
    
    <!-- Anonymous Indicator -->
    <div class="bg-gray-50 rounded-lg p-6">
        {#if anonymousSubmissions}
            <span class="text-xl font-semibold mb-4 bg-yellow-100 text-yellow-800 rounded">
                Please Note: This Call is currently set to anonymous. Author data will still be collected, but it will not be visible in the dashboard except to designated editors.
            </span>
        {/if}
    </div>

    <!-- Submit buttons -->
    <div class="flex gap-4">
      <button 
        type="submit" 
        disabled={loading}
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Call'}
      </button>
      <a 
        href="/calls" 
        class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
      >
        Cancel
      </a>
    </div>
  </form>
</div>