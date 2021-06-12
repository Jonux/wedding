<script>
    import TitleButton from './TitleButton.svelte';
	export let title;
</script>

<img src="./images/kuva-ekstra-kranssi-tekstillä-iso.png"  alt="title image" class="top-image" />
<div class="menu-row">
    <TitleButton text="Etusivu" />
    <TitleButton text="Ilmoittaudu" />
    <TitleButton text="Lisätietoa" />
</div>


<style type="text/scss">
  @import './variables';

    .menu-row {
        background: #ababad;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-around;
    }
    .top-image {
        height: 300px;
        margin-bottom: 30px;
    }
</style>