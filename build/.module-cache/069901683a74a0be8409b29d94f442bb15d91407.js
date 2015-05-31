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
				React.createElement("form", {className: "signIn", role: "form"}, 
					React.createElement("p", null, "Sign In"), 
				  React.createElement("div", {className: "form-group"}, 
				    React.createElement("label", {for: "email"}, "Your Email:"), 
				    React.createElement("input", {type: "email", className: "form-control", id: "email", name: "email"})
				  ), 
				  React.createElement("div", {className: "form-group"}, 
				    React.createElement("label", {for: "pwd"}, "Password :"), 
				    React.createElement("input", {type: "password", className: "form-control", id: "pwd", name: "password"})
				  ), 
				  React.createElement("div", {className: "checkbox"}, 
				    React.createElement("label", null, React.createElement("input", {type: "checkbox"}), "Remember me")
				  ), 
				  React.createElement("button", {type: "submit", className: "btn btn-default"}, "Submit"), 
				  React.createElement("p", null, 
						React.createElement("a", {href: "#", className: "sign-form-swap"}, "Sign Up")
					)
				), 
				React.createElement("form", {className: "signUp"}
					

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

