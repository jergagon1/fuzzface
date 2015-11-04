require 'spec_helper'

describe 'Signup' do
  context 'wrong data' do
    let!(:wrong_params) do
      {
        'username' => 'username',
        'email' => 'email',
        'password' => 'password',
        'zipcode' => 'zipcode'
      }
    end

    let!(:wrong_response) do
      {
        'error' => {
          'username' => 'Has already be taken'
        }
      }
    end

    before do
      response_double = double(status: 422, body: wrong_response.to_json)
      allow(User).to receive(:sign_up).with(wrong_params).and_return(response_double)

      post '/sign_up', wrong_params, { 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest' }
    end

    it 'returns correct body json' do
      expect(last_response.body).to eq wrong_response.to_json
    end
  end

  context 'correct data' do
    let!(:users_params) do
      {
        'username' => 'username',
        'email' => 'email',
        'password' => 'password',
        'zipcode' => 'zipcode'
      }
    end

    before do
      response_double = double(status: 200, body: users_params.to_json)
      allow(User).to receive(:sign_up).with(users_params).and_return(response_double)

      post '/sign_up', users_params, { 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest' }
    end

    it 'returns status 200' do
      expect(last_response.status).to eq 200
    end

    it 'returns correct body json' do
      expect(last_response.body).to eq users_params.to_json
    end
  end
end
