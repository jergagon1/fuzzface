get "/fuzzfeed" do
  # sessions
  # if not logged in
  #   redirect to sign up / login
  # else
  #   retrieve @articles json
  #   render fuzzfeed page template
  erb :fuzzfeed

end