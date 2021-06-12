<script>
    import { Link } from "svelte-routing";
    import TitleButton from './TitleButton.svelte';
</script>

<div class="image-container">
    <img src="./images/kuva-ekstra-kranssi-tekstillä-iso.png"  alt="title image" class="top-image" />
</div>

<div class="menu-row">
  <nav>
    <Link to="/" class="navigate-button">Etusivu</Link>
    <Link to="register" class="navigate-button">Ilmoittaudu</Link>
  </nav>
</div>

<style type="text/scss">
  @import './variables';

    .image-container {
        text-align: center;
    }
    nav {
        background: $darkBackgroundColor;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-around;
        height: 40px;
    }
    .top-image {
        height: 300px;
        margin-bottom: 30px;
    }

    .navigate-button > :global(a) {
        text-decoration: none;

        &:hover {
            cursor: pointer;
            color: red;
            text-decoration: underline;
        }
    }

    :global(a) {
        color: black;
        width: 100px;
        height: 40px;

        font-family: 'Candara Bold';
        padding-top: 10px;
        padding-bottom: 20px;
        font-variant: all-petite-caps;

        &:hover {
            cursor: pointer;
            color: red;
            text-decoration: underline;
        }
    }

    @media (max-width: 600px) {
        .top-image {
            height: 250px;
            margin-bottom: 30px;
        }
	}
</style>