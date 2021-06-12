<script>
	import Title from './components/Title.svelte';
	import LeftContentBox from './components/LeftContentBox.svelte';
	import RightContentBox from './components/RightContentBox.svelte';
	import BottomInfo from './components/bottombar/BottomInfo.svelte';
	export let title;
</script>

<link rel="stylesheet" href="node_modules/svelte-material-ui/bare.css" />
<main>
	<Title />

	<LeftContentBox
		src="./images/kuva1-oksa.png" 
		title="Sydämmellisesti tervetuloa hääsivustollemme!" 
		description="Tällä sivulla voi ilmoittaa tulostasi tai mahdollisesta esteestä ja lukea ajantasaista infoa häistä." 
	/>
	<RightContentBox
		src="./images/kuva9-lintu.jpg" 
		title="Muistathan ilmoittautua 31.8.2021 mennessä" 
		description="Ilmoitathan tulostasi tai mahdollisesta esteestä- Ilmoittautumislomake sis. tiedon allergioista ja erityisruokavalioista." 
		button="Ilmoittaudu tästä"
	/>

	<LeftContentBox
		src="./images/kuva10-talo.jpg" 
		title="Päivittyvää lisätietoa" 
		description="Lue lisätietoa, jota hääkutsusta ei löytynyt! Tällä sivulla päivittyvää tietoa kuten ohjeita parkkeeraamiseen ja ohjelmanumeron varaamiseen." 
		button="Lisätietoa"
	/>


	<BottomInfo />
	<!--

	<p>***</p>
	<p>Hääpäivä: 18.9.2021, vihkitilaisuus klo 13:30, pääjuhla 15:00 - 00:30</p>
	<p>Vihkiminen eli kirkko: Otaniemen kappeli, Jämeräntaival 8, 02150 Espoo</p>
	<p>Juhlatila: Thorstop, Vanha maantie 12, 02600 Espoo</p>
	<p>Pukukoodi: Juhlava pukeutuminen</p>
	<p>***</p>
	<p>Muistaminen Meille tärkeintä on, että tulette juhlimaan kanssamme tärkeää päiväämme. Halutessasi voit muistaa meitä kartuttamalla häämatkakassaamme: FI13 1470 3501 0573 87 / Joel Huttunen tai Anni Laitinen</p>
	<p>Ilmoittautuminen on nyt auki google formissa ( linkki )! Formiin allergiat</p>
	<p>***</p>
    <p>Ilmoitathan tulostasi tai mahdollisesta esteestä 31.8.2021 mennessä hääsivuston lomakkeella:  (sis. tiedon allergioista ja erityisruokavalioista). Vaihtoehtoisesti voit ilmoittautua puhelimitse. </p>
	<p>Jos haluat pitää häissämme puheen tai olet suunnitellut jotain muuta ohjelmaa, niin ilmoitathan siitä etukäteen seremoniamestarille, jotta saamme mieluisesi ohjelmanumeron hääjuhlan aikatauluun. </p>
	<p>Parkkeeraus ensisijaisesti alapihalle (urheilupuisto).</p>
	<p>***</p>
	<b>Yhteyshenkilöt</b>
	<p>Joel: 050-4522882</p>
	<p>Anni: 040-8497736</p>
	-->
</main>

<style type="text/scss">
  @import './variables';

  $color: black;

	div {
		background: $bgPrimary;  
		// ... Other styles
	}
	
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: $color;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>