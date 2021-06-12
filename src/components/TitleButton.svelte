<div class="button">{$$props.text}</div>

<style type="text/scss">
  @import './variables';

    .button {
        color: black;
        width: 100px;

        padding-top: 20px;
        padding-bottom: 20px;
        font-variant: all-petite-caps;

        &:hover {
            cursor: pointer;
            color: gray;
            text-decoration: underline;
        }
    }
</style>