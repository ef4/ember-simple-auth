var testRoute;
var TestRoute = Ember.Route.extend(Ember.SimpleAuth.AuthenticatedRouteMixin, {
  send: function(name) {
    this.invokedLogin = (name === 'login');
  }
});

var attemptedTransitionMock;
var AttemptedTransitionMock = Ember.Object.extend({
  abort: function() {
    this.aborted = true;
  },
  send: function(name) {
    this.invokedLogin = (name === 'login');
  }
});

module('Ember.SimpleAuth.AuthenticatedRouteMixin', {
  setup: function() {
    testRoute               = TestRoute.create();
    attemptedTransitionMock = AttemptedTransitionMock.create();
    var session             = Ember.SimpleAuth.Session.create({ store: Ember.SimpleAuth.Stores.Ephemeral.create() });
    testRoute.set('session', session);
  }
});

test('triggers login correctly', function() {
  testRoute.triggerLogin(attemptedTransitionMock);

  equal(testRoute.get('session.attemptedTransition'), attemptedTransitionMock, 'Ember.SimpleAuth.AuthenticatedRouteMixin saves the attempted transition in the session when login is triggered.');
  ok(attemptedTransitionMock.invokedLogin, 'Ember.SimpleAuth.AuthenticatedRouteMixin invokes the login action on the attempted transition when login is triggered.');
  ok(!testRoute.invokedLogin, 'Ember.SimpleAuth.AuthenticatedRouteMixin does not invoke the login action on the route if the attempted transition supports it when login is triggered.');
});

test('triggers login in beforeModel when the session is not authenticated', function() {
  testRoute.set('session.isAuthenticated', false);
  testRoute.beforeModel(attemptedTransitionMock);

  ok(attemptedTransitionMock.invokedLogin, 'Ember.SimpleAuth.AuthenticatedRouteMixin triggers login in beforeModel when the session is not authenticated.');

  testRoute.set('session.isAuthenticated', true);
  attemptedTransitionMock.invokedLogin = false;
  testRoute.beforeModel(attemptedTransitionMock);

  ok(!attemptedTransitionMock.invokedLogin, 'Ember.SimpleAuth.AuthenticatedRouteMixin does not trigger login in beforeModel when the session is authenticated.');
});

test('aborts the attempted transaction in beforeModel when the session is not authenticated', function() {
  testRoute.set('session.isAuthenticated', false);
  testRoute.beforeModel(attemptedTransitionMock);

  ok(attemptedTransitionMock.aborted, 'Ember.SimpleAuth.AuthenticatedRouteMixin aborts the attempted transition in beforeModel when the session is not authenticated.');

  testRoute.set('session.isAuthenticated', true);
  attemptedTransitionMock.aborted = false;
  testRoute.beforeModel(attemptedTransitionMock);

  ok(!attemptedTransitionMock.aborted, 'Ember.SimpleAuth.AuthenticatedRouteMixin does not abort the attempted transition in beforeModel when the session is authenticated.');
});
