<script>
    import LargeIcon from './LargeIcon.svelte';
    import ContactInfo from './ContactInfo.svelte';
	export let title;
</script>

<h2 class="bottom-title">Sanomme toisillemme tahdon</h2>

<div class="menu-row">
    <LargeIcon src="./images/kuva8-kalenteri.png" text="18. syyskuu 2021" />
    <LargeIcon src="./images/kuva6-kello.png" text="Klo 13.30" />
    <LargeIcon src="./images/kuva7-paikka.png" text="Otaniemen kappeli" />
</div>

<ContactInfo />

<style type="text/scss">
  @import './variables';

.bottom-title {

}
    .menu-row {    
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-around;
        margin-bottom: 20px;
    }
    .top-image {
        height: 300px;
        margin-bottom: 30px;
    }
</style>