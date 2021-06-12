<script>
	import MainPage from './scenes/MainPage.svelte';
</script>


<svelte:head>
  <link rel="stylesheet" href="node_modules/svelte-material-ui/bare.css" />
  <link href="https://fonts.googleapis.com/css?family=Gelasio" rel="stylesheet">
</svelte:head>

<main>
	<MainPage />
</main>

<style type="text/scss">
  @import './variables';

	@font-face {
		font-family: 'Palace Script MT';
		src: url("/fonts/PALSCRI.TTF") format("ttf");
		font-style: regular;
    }
	
	@font-face {
		font-family: 'DancingScript';
		src: url("/fonts/DancingScript-VariableFont_wght.ttf") format("ttf");
		font-style: regular;
	}
	
    @font-face {
		font-family: 'Candara';
		src: url("/fonts/CANDARA.TTF") format("ttf");
		font-style: regular;
	}

	@font-face {
		font-family: 'Candara Bold';
		src: url("/fonts/CANDARAB.TTF") format("ttf");
		font-style: bold;
	}

	main {
		font-family: 'Candara';
		max-width: 900px;
		margin: 0 auto;
		border-style: solid;
		border-width: 1px;
		border-color: #eeeeee;
	}
</style>