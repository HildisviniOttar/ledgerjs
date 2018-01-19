import HttpTransport from "./HttpTransport";
export default (url: ?string) => {
  if (!url) return HttpTransport; // by default, HttpTransport don't yield anything in list/discover
  class StaticHttpTransport extends HttpTransport {
    static list = (): * => HttpTransport.open(url).then(() => [url], () => []);
    static discover = (observer: *) => {
      let unsubscribed = false;

      function attemptToConnect() {
        if (unsubscribed) return;
        HttpTransport.open(url, 5000).then(
          () => {
            if (unsubscribed) return;
            observer.next(url);
            observer.complete();
          },
          () => {
            if (unsubscribed) return;
            setTimeout(attemptToConnect, 1000);
          }
        );
      }
      attemptToConnect();
      return {
        unsubscribe: () => {
          unsubscribed = true;
        }
      };
    };
  }
  return StaticHttpTransport;
};