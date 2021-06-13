<script>
    import BasePage from './BasePage.svelte';
	import Title from '../components/Title.svelte';
	import LeftContentBox from '../components/LeftContentBox.svelte';
	import RightContentBox from '../components/RightContentBox.svelte';
	import BottomInfo from '../components/bottombar/BottomInfo.svelte';
</script>

<BasePage>
    <div class="info">
        <h1>Ilmoittautuminen</h1>
        <p>Tällä lomakkeella voit ilmoittaa tulostasi / estymisestä Joelin ja Annin häihin 18.9.2021 sekä mahdollisista allergioista tai erityisruokavaliosta. Mikäli, lomake ei näy laitteellasi voit avata sen myös erilliseen välilehteen:</p>
        <a href="https://forms.gle/ZmHEETtU2sHoP5ML8">https://forms.gle/ZmHEETtU2sHoP5ML8</a>
    </div>
    <div class="container">
        <iframe 
            title=""
            src="https://docs.google.com/forms/d/e/1FAIpQLScR_MPWApjknTI46LEcxaFMlfKGg9JVVF5eGV53Fb6_PszWoQ/viewform?embedded=true" 
            onload = "window.parent.scrollTo(0,0)" id="oc-contact" width="800" height="1260" frameborder="0" marginheight="0" marginwidth="0">Ladataan...</iframe>
    </div>
</BasePage>


<style type="text/scss">
  @import './variables';
    .container {
        display: flex;
        margin-top: 20px;
    }
</style>
