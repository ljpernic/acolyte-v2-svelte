<script>
  import { onMount } from 'svelte';
  import Quill from 'quill';
  
  export let value = '';
  export let placeholder = '';
  export let name = 'description';
  export let minHeight = '150px';
  
  let editor;
  let quill;
  
  onMount(() => {
    quill = new Quill(editor, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['link'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['clean']
        ],
        keyboard: {
          bindings: {
            tab: false, // Simply disable tab functionality
            'shift+tab': false // Disable shift+tab too
          }
        }
      }
    });
    
    // Set initial content
    if (value) {
      quill.root.innerHTML = value;
    }
    
    // Listen for changes
    quill.on('text-change', () => {
      value = quill.root.innerHTML;
    });
  });
</script>

<svelte:head>
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
</svelte:head>

<div 
  bind:this={editor} 
  class="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500" 
  style="min-height: {minHeight}"
></div>
<input type="hidden" {name} bind:value />

<style>
  :global(.ql-editor) {
    /* Make the entire editor area clickable */
    min-height: inherit !important;
    font-family: inherit !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
    padding: 12px !important;
  }
  
  :global(.ql-container) {
    font-family: inherit !important;
    font-size: 14px !important;
  }
  
  :global(.ql-toolbar) {
    border-bottom: 1px solid #e5e7eb !important;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    padding: 8px 12px !important;
  }
  
  :global(.ql-container .ql-editor) {
    border: none !important;
  }
  
  /* Make placeholder consistent */
  :global(.ql-editor.ql-blank::before) {
    color: #9ca3af !important;
    font-style: normal !important;
  }
</style>