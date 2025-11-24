<script lang="ts">
  import { Label, Input } from 'flowbite-svelte';
  import { SignIn } from '$lib';
  import MetaTag from '$lib/utils/MetaTag.svelte';
  let title = 'Sign in';
  let site = {
    name: 'Flowbite',
    img: '/images/acolyte-icon-logo.png',
    link: '/',
    imgAlt: 'FlowBite Logo'
  };
  let rememberMe = true;
  let lostPassword = true;
  let createAccount = true;
  let lostPasswordLink = 'forgot-password';
  let loginTitle = 'Login to your account';
  let registerLink = '/';
  let createAccountTitle = 'Create account';

const onSubmit = async (e: Event) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const email = formData.get('email');
  const password = formData.get('password');

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    // Redirect to dashboard (or wherever)
    window.location.href = '/dashboard';
  } else {
    alert(data.error || 'Login failed');
  }
};

  const path: string = '/authentication/sign-in';
  const description: string = 'Sign in example - Flowbite Svelte Admin Dashboard';
  const metaTitle: string = 'Flowbite Svelte Admin Dashboard - Sign in';
  const subtitle: string = 'Sign in';
</script>

<MetaTag {path} {description} title={metaTitle} {subtitle} />

<SignIn {title} {site} {rememberMe} {lostPassword} {createAccount} {lostPasswordLink} {loginTitle} {registerLink} {createAccountTitle} onsubmit={onSubmit}>
  <div>
    <Label for="email" class="mb-2 dark:text-white">Your email</Label>
    <Input type="email" name="email" id="email" placeholder="name@company.com" required class="border outline-none dark:border-gray-600 dark:bg-gray-700" />
  </div>
  <div>
    <Label for="password" class="mb-2 dark:text-white">Your password</Label>
    <Input type="password" name="password" id="password" placeholder="••••••••" required class="border outline-none dark:border-gray-600 dark:bg-gray-700" />
  </div>
</SignIn>
