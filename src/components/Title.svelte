<script>
    import { Link } from "svelte-routing";
</script>

<div class="image-container">
    <img src="./images/kuva-kranssi.png"  alt="Joan title" class="top-image" />
</div>

<div class="menu-row">
  <nav>
    <Link to="/"><span class="navigate-button">Etusivu</span></Link>
    <Link to="register"><span class="navigate-button">Ilmoittaudu</span></Link>
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
        height: 30px;
        padding-top: 10px;
    }
    .top-image {
        height: 300px;
        margin-bottom: 30px;
    }

    :global(a) {
        text-decoration: none;
    }

    .navigate-button  {
            color: black;
        font-family: 'Candara Bold';
    
      text-decoration: none;
      font-variant: all-petite-caps;

        &:hover {
            cursor: pointer;
            color: $grayTextColor;
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
