<script>
	import Title from '../components/Title.svelte';
	import LeftContentBox from '../components/LeftContentBox.svelte';
	import RightContentBox from '../components/RightContentBox.svelte';
	import BottomInfo from '../components/bottombar/BottomInfo.svelte';
</script>

<main>
	<Title />

	<div class="container">
        <slot></slot>
	</div>
	<BottomInfo />
</main>

<style type="text/scss">
  @import './variables';

	.container {
		padding: 1em;
    }

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