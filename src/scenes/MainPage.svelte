<script>
    import BasePage from './BasePage.svelte';
	import Title from '../components/Title.svelte';
	import LeftContentBox from '../components/LeftContentBox.svelte';
	import RightContentBox from '../components/RightContentBox.svelte';
	import BottomInfo from '../components/bottombar/BottomInfo.svelte';
</script>

<BasePage>
		<LeftContentBox
			src="./images/kuva1-oksa.png" 
			title="Sydämmellisesti tervetuloa hääsivustollemme!"  
		>
			<p>Tällä sivulla voi ilmoittaa tulostasi tai mahdollisesta esteestä ja lukea ajantasaista infoa häistä.</p>
		</LeftContentBox>

		<RightContentBox
			src="./images/kuva9-lintu.jpg" 
			title="Muistathan ilmoittautua 31.8.2021 mennessä" 
			button="Ilmoittaudu tästä"
		>
			<p>Ilmoitathan tulostasi tai mahdollisesta esteestä- Ilmoittautumislomake sis. tiedon allergioista ja erityisruokavalioista.</p>
		</RightContentBox>

		<LeftContentBox
			src="./images/kuva10-talo.jpg" 
			title="Päivittyvää lisätietoa" 
			button="Lisätietoa"
		>
			<p>Lue lisätietoa, jota hääkutsusta ei löytynyt! Tällä sivulla päivittyvää tietoa kuten ohjeita parkkeeraamiseen ja ohjelmanumeron varaamiseen.</p>
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
</BasePage>
