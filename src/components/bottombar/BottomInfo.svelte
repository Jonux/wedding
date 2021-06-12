<script>
    import LargeIcon from './LargeIcon.svelte';
    import ContactInfo from './ContactInfo.svelte';
	export let title;
</script>

<div class="text-container">
    <h2 class="bottom-title">Sanomme toisillemme </h2><h2 class="styled-text">tahdon</h2>
</div>
<div class="menu-row">
    <LargeIcon src="./images/kuva8-kalenteri.png" text="18. syyskuu 2021" />
    <LargeIcon src="./images/kuva6-kello.png" text="Klo 13.30" />
    <LargeIcon src="./images/kuva7-paikka.png" text="Otaniemen kappeli" />
</div>

<ContactInfo />

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
    
    .bottom-title {
        padding-right: 1em;
        font-family: 'DancingScript';
    }

    .menu-row {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-around;
        margin-bottom: 20px;
        font-family: 'Candara';
    }
    .top-image {
        height: 300px;
        margin-bottom: 30px;
    }
    .text-container {
        margin-left: 16px;
        display: flex;
    }
    .styled-text {
        float: left;
        font-family: 'DancingScript';
    }
</style>
