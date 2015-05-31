// var SignInPageContainer = React.createClass({

// 	render: function() {
// 		return (<div>Hello</div>);
// 	}

// });

// React.render(new SignInPageContainer, document.body)

var HelloWorld = React.createClass({displayName: "HelloWorld",
    render: function() {
        return React.createElement("div", null, "Hello, world!");
    }
});

React.render(new HelloWorld(), document.body);