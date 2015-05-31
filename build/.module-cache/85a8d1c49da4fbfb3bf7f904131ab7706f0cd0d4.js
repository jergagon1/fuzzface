var SignInPageContainer = React.createClass({displayName: "SignInPageContainer",
	render: function() {
		return (
			React.createElement("div", {className: "container"}, 
				"container"
			)
		);
	}
});


React.render(
	React.createElement(SignInPageContainer, null),
	 document.body
);

