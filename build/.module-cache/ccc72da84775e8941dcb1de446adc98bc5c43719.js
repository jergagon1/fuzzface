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

var SignInPageTitle = React.createClass({displayName: "SignInPageTitle",
	render: function() {
		return (
		React.createElement("div", null, 	
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
				
			), 
			"//below here in this component", 
			React.createElement("div", {className: "title-container"}, 
				React.createElement("img", {className: "index-dog-img", src: "images/dog-title.jpg"})

			)
		)
		);
	}
});

// React.render(
// 	<SignInPageNav />,
// 	 document.body
// );

React.render(
	React.createElement(SignInPageTitle, null),
	 document.body
);

