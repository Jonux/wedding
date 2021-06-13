<script>
	import MediaQuery from "./MediaQuery.svelte";
</script>

<MediaQuery query="(min-width: 601px)" let:matches>
	{#if matches}
    <div class="container">
        <div class="text-area"> 
            <h2>{$$props.title}</h2>
            <slot></slot>
        </div>
        <div class="image-container">
            <img src={$$props.src} alt="image" class="image" />
        </div>
    </div>
	{/if}
</MediaQuery>

<MediaQuery query="(max-width: 600px)" let:matches>
	{#if matches}
        <div class="text-area-small"> 
            <h2 class="small-title" style="{$$props.titleStyle}">{$$props.title}</h2>
            <img src={$$props.src} alt="image" class="image-small" />
        </div>
        <div>
            <slot></slot>
        </div>
	{/if}
</MediaQuery>

<style type="text/scss">
  @import './variables';

    .container {
        display: flex;
        margin-top: 20px;
    }
    .image-container {
        width: 40%;
    }

    .text-area {
        text-align: left;
        padding: 20px;
        width: 50%;
    }

    .image {
        height: 200px;
    }

    .text-area-small {
        text-align: left;
        display: flex;
        width: 100%;
    }

    .small-title {
        width: 80%;
    }

    .image-small {
        float: right;
        height: 100px;
        margin-top: auto;
    }
</style>
