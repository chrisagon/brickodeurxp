<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();

  $effect(() => {
    if (!data.session) {
      goto('/auth/login');
    } else {
      const role = data.session.user.role;
      if (role === 'jeune')          goto('/jeune/passeport');
      else if (role === 'animateur') goto('/animateur/validations');
      else if (role === 'parent')    goto('/parent/enfant');
      else if (role === 'admin')     goto('/admin/competences');
    }
  });
</script>
