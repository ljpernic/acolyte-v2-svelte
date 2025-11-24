<script lang="ts">
  import { Label, Input, DarkMode, NavBrand, NavHamburger, NavLi, NavUl, Navbar, Toggle, P } from 'flowbite-svelte';
  import { SignIn } from '$lib';
  import MetaTag from '$lib/utils/MetaTag.svelte';
  import { Footer } from '$lib';

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

  const path: string = '/login';
  const description: string = 'Login at the Acolyte Submission System';
  const pageTitle: string = 'Login - Acolyte Submission System';
  const subtitle: string = 'Login';
</script>

<MetaTag {path} {description} {pageTitle} {subtitle} />

<Navbar class="fixed start-0 top-0 z-20 w-full border-b border-gray-200 bg-white px-2 py-1 sm:px-4 dark:border-gray-700 dark:bg-gray-900" color="dark">
  <NavBrand href="/">
    <img src="/images/acolyte-icon-logo.png" class="me-3 h-6 sm:h-9" alt="Acolyte Logo" />
    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Acolyte</span>
  </NavBrand>
  <NavHamburger />

  <NavUl class="ms-8 me-auto">
      <NavLi>
        <a href="/pages/about" data-sveltekit-preload-data="hover">About</a>
      </NavLi>
      <NavLi>
        <a href="/pages/presses" data-sveltekit-preload-data="hover">Presses</a>
      </NavLi>
      <NavLi>
        <a href="/pages/features" data-sveltekit-preload-data="hover">Features</a>
      </NavLi>
      <NavLi>
        <a href="/pages/guides" data-sveltekit-preload-data="hover">Guides</a>
      </NavLi>
      <NavLi>
        <a href="/pages/contact" data-sveltekit-preload-data="hover">Contact</a>
      </NavLi>
    </NavUl>
    <div class="py-4">
      <DarkMode />
    </div>
</Navbar>

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
<Footer />