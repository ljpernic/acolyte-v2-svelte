<script lang="ts">
  import { Label, Input } from 'flowbite-svelte';
  import { SignIn } from '$lib';

  let title = 'Sign in';

  const onSubmit = async (e: Event) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString();
    }

    try {
        const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
        });

      const result = await res.json();

      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };
</script>

<SignIn {title} onsubmit={onSubmit}>
  <div>
    <Label for="email">Email</Label>
    <Input type="email" name="email" id="email" required />
  </div>
  <div>
    <Label for="password">Password</Label>
    <Input type="password" name="password" id="password" required />
  </div>
</SignIn>
