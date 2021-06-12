<div class="container">
    <div class="image-container">
        <img src={$$props.src} alt="image" class="image" />
    </div>
    <div class="description">{$$props.text}</div>
</div>

<style type="text/scss">
  @import './variables';

    .container {
        text-align: center;
    }

    .image {
        text-align: center;
        height: 100px;
        margin-bottom: 20px;
    }

    .description {
        text-align: center;
    }
    @media (max-width: 600px) {
        .image {
            text-align: center;
            height: 50px;
            margin-bottom: 20px;
        }
	}
</style>