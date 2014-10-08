Router.map(function() {
  var isPostRequest = function(request, response) {
    var requestMethod = request.method;
    if (requestMethod !== "POST") {
      console.warn("[API] Unsupported method: " + requestMethod);
      response.writeHead(405, {'Content-Type': 'text/html'});
      response.end('<html><body>Unsupported method: ' + requestMethod + '</body></html>');
      return false;
    }
    return true;
  };

  this.route('authenticate', {
    path: '/api/authenticate/applications/:applicationId',
    where: 'server',
    action: function() {
      if (!isPostRequest(this.request, this.response)) {
        return;
      }

      var token = this.request.headers["x-auth-token"];
      var applicationId = this.params.applicationId;
      var session = this.request.body.session;
      var authenticatedResponse = Application.authenticatedResponse(applicationId, token, session);
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
