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
	>
		Tällä sivulla voi ilmoittaa tulostasi tai mahdollisesta esteestä ja lukea ajantasaista infoa häistä.
	</LeftContentBox>

	<RightContentBox
		src="./images/kuva9-lintu.jpg" 
		title="Muistathan ilmoittautua 31.8.2021 mennessä" 
		button="Ilmoittaudu tästä"
	>
		Ilmoitathan tulostasi tai mahdollisesta esteestä- Ilmoittautumislomake sis. tiedon allergioista ja erityisruokavalioista.
	</RightContentBox>

	<LeftContentBox
		src="./images/kuva10-talo.jpg" 
		title="Päivittyvää lisätietoa" 
		button="Lisätietoa"
	>
		Lue lisätietoa, jota hääkutsusta ei löytynyt! Tällä sivulla päivittyvää tietoa kuten ohjeita parkkeeraamiseen ja ohjelmanumeron varaamiseen.
	</LeftContentBox>

	<RightContentBox
		src="./images/kuva3-hääpari.jpg" 
		title="Perusinformaatio" 
	>
		<div class="base-info">
			<p>Hääpäivä: 18.9.2021, vihkitilaisuus klo 13:30, pääjuhla 15:00 - 00:30</p>
			<p>Vihkiminen eli kirkko: Otaniemen kappeli, Jämeräntaival 8, 02150 Espoo</p>
			<p>Juhlatila: Thorstop, Vanha maantie 12, 02600 EspooParkkeeraus ensisijaisesti alapihalle (urheilupuisto). </p>
			<p>Pukukoodi: Juhlava pukeutuminen</p>
		</div>
	</RightContentBox>

	<LeftContentBox
		src="./images/kuva4-puhekupla.jpg" 
		title="Ohjelmanumeron järjestäminen" 
		button="Lisätietoa"
	>
		<p class="base-info">Jos haluat pitää häissämme puheen tai olet suunnitellut jotain muuta ohjelmaa, niin ilmoitathan siitä etukäteen seremoniamestarille, jotta saamme mieluisesi ohjelmanumeron hääjuhlan aikatauluun.</p>
		<br />
		<p>Seremoniamestari: Henry Sanmark</p>
		<p>+358 503457711</p>
		<p>henry.sanmark@iki.fi</p>
	</LeftContentBox>

	<RightContentBox
		src="./images/kuva5-kukka.jpg" 
		title="Muistaminen" 
	>
		<div class="base-info">
			<p>Meille tärkeintä on, että tulette juhlimaan kanssamme tärkeää päiväämme. Halutessasi voit muistaa meitä kartuttamalla häämatkakassaamme:</p>
			<p>FI13 1470 3501 0573 87 (Nordea)</p>
			<p>Joel Huttunen tai Anni Laitinen</p>
		</div>
	</RightContentBox>

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

  .base-info {
	  text-align: left;
  }

	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		max-width: 900px;
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
			max-width: 900px;
		}
	}
</style>