export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    let response;
    try {
      response = await env.ASSETS.fetch(request);
    } catch {
      return new Response("Not found", { status: 404 });
    }

    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot|webp|geojson)(\?.*)?$/)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
