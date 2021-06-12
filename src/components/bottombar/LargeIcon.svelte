<div>
    <div class="image-container">
        <img src={$$props.src} alt="image" class="image" />
    </div>
    <div class="description">{$$props.text}</div>
</div>

<style type="text/scss">
  @import './variables';

    .image {
        height: 100px;
        margin-bottom: 20px;
    }

    .description {

    }
</style>