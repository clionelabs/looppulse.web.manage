Router.map(function() {
  this.route('authenticate', {
    path: '/api/authenticate/applications/:applicationId',
    where: 'server',
    action: function() {
      var requestMethod = this.request.method;
      if (requestMethod != "GET") {
        this.response.writeHead(403, {'Content-Type': 'text/html'});
        this.response.end('<html><body>Unsupported method: ' + requestMethod + '</body></html>');
        return;
      }

      var token = this.request.headers["x-auth-token"];
      var applicationId = this.params.applicationId;
      var authenticatedResponse = Application.authenticatedResponse(applicationId, token);
      if (authenticatedResponse.statusCode != 200) {
        console.warn("[API] Application " + applicationId +
          " failed to authenticate with token " + token +
          " from " + JSON.stringify(this.request.headers));
      }
      this.response.writeHead(authenticatedResponse.statusCode,
        {'Content-Type': 'application/json'});
      this.response.end(JSON.stringify(authenticatedResponse));
    }
  });
});
