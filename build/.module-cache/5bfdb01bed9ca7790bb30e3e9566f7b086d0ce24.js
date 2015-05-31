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
			
			React.createElement("div", {className: "title-container"}, 
				React.createElement("img", {className: "index-dog-img", src: "images/dog-title.jpg"})
			), 


				React.createElement("div", {className: "sign-in-form-container"}, 
				React.createElement("p", null, "Sign In"), 
				React.createElement("form", {role: "form"}, 
				  React.createElement("div", {class: "form-group"}, 
				    React.createElement("label", {for: "email"}, "Your Email:"), 
				    React.createElement("input", {type: "email", class: "form-control", id: "email"})
				  ), 
				  React.createElement("div", {class: "form-group"}, 
				    React.createElement("label", {for: "pwd"}, "Password :"), 
				    React.createElement("input", {type: "password", class: "form-control", id: "pwd"})
				  ), 
				  React.createElement("div", {class: "checkbox"}, 
				    React.createElement("label", null, React.createElement("input", {type: "checkbox"}), "Remember me")
				  ), 
				  React.createElement("button", {type: "submit", class: "btn btn-default"}, "Submit")
				)

				
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

