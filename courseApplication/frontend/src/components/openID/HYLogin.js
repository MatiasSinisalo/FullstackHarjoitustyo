const HYLogin = ({}) => {
    const client_id = 'id_af7f822a95ec6e8b8316268f679b9aa6'
    const redirect_uri = 'https://frontend-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi/';
  
  
    return(
      <>
        <a href={`https://login-test.it.helsinki.fi/idp/profile/oidc/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid%20profile`}>
          log in using HY
        </a>
      </>
    )
  }



const HYLoginAuthenticate = ({}) => {

    return (<p>not implemented</p>)
}


export {HYLogin, HYLoginAuthenticate}