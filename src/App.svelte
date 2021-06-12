<script>
	import { Router, Link, Route } from "svelte-routing";
	import MainPage from './scenes/MainPage.svelte';
	import RegisterPage from './scenes/RegisterPage.svelte';
  	export let url = "";
</script>

<Router url="{url}">
  <div>
    <Route path="register" component="{RegisterPage}" />
    <Route path="/"><MainPage /></Route>
  </div>
</Router>
