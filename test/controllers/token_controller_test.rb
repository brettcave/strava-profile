require 'test_helper'

class TokenControllerTest < ActionController::TestCase
  test "should get receive" do
    get :receive
    assert_response :success
  end

end
