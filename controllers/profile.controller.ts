import { Router } from "@oak/oak/router";

const profileController = new Router()
    .get("/", (context) => {
        context.response.body = "Profile Page";
    })


export default profileController;