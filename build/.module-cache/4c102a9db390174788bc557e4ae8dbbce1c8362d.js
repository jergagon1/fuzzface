var SignInPageContainer = React.createClass({displayName: "SignInPageContainer",
	render: function() {
		return (
			React.createElement("div", {className: "container"}, 
				"container"
			)
		);
	}
});

var SignInPageNav = React.createClass({displayName: "SignInPageNav",
	render: function() {
		return (
			React.createElement("div", {className: "nav-container"}, 
				React.createElement("div", {className: "logo-container"}, 
					React.createElement("img", {className: "logo-img", src: "images/FuzzFinders_Logo_small.png"})
				), 
				React.createElement("div", {className: "nav-list-container"}, 
					React.createElement("ul", {className: "nav-list"}, 
						React.createElement("li", null, React.createElement("a", {href: "#"}, "About")), 
						React.createElement("li", null, React.createElement("a", {href: "#"}, "FAQ")), 
						React.createElement("li", null, React.createElement("a", {href: "#"}, "Contact"))
					)
				)
				
			)
		);
	}
});

React.render(
	React.createElement(SignInPageNav, null),
	 document.body
);

