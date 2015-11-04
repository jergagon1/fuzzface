require 'spec_helper'

describe 'the signin process', type: :feature do
  context 'correct credentials' do
    before do
      response_double = double(code: 200, body: '{"id":17,"username":"blah","email":"blah@blah.com","password_hash":"password","zipcode":null,"logged_in":true,"admin":false,"wags":7,"created_at":"2015-05-31T17:56:46.073Z","updated_at":"2015-05-31T18:52:36.266Z"}')
      allow(HTTParty).to receive(:post).and_return(response_double)
    end

    it 'signs me in' do
      visit '/sign_in'
      within(".signIn") do
        fill_in 'email', with: 'blah@blah.com'
        fill_in 'pwd', with: 'password'
      end

      click_button 'signInSubmit'

      expect(current_path).to eq '/'

      expect(page).to have_content 'Logout'
    end
  end

  context 'wrong credentials', js: true do
    before do
      error = 'Invalid password or email'
      response_double = double(code: 422, body: { error: error }.to_json)
      allow(HTTParty).to receive(:post).and_return(response_double)
    end

    it 'signs me in' do
      visit '/sign_in'
      within(".signIn") do
        fill_in 'email', with: 'wrong@blah.com'
        fill_in 'pwd', with: 'password'
      end

      click_button 'Submit'

      expect(current_path).to eq '/sign_in'
      expect(page).to have_content 'Invalid password or email'
    end
  end
end
