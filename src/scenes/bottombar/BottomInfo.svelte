<script>
    import LargeIcon from './LargeIcon.svelte';
    import ContactInfo from './ContactInfo.svelte';
</script>

<div class="text-container">
    <h2 class="bottom-title">Sanomme toisillemme <span class="styled-text">tahdon</span></h2>
</div>

{#if $$props.showDetails}
    <div class="menu-row">
        <LargeIcon src="./images/kuva8-kalenteri.png" text="18. syyskuu 2021" />
        <LargeIcon src="./images/kuva6-kello.png" text="Klo 13.30" />
        <LargeIcon src="./images/kuva7-paikka.png" text="Otaniemen kappeli" />
    </div>
{/if}

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
        text-align: center;
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
        text-align: center;
        margin-left: 36px;
        display: block;
        margin-bottom: 30px;
        margin-top: 20px;
    }
    .styled-text {
        font-family: 'DancingScript';
        font-style: italic;
    }
</style>
