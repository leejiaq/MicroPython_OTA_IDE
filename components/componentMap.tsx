const componentMap = {
  h1: (props:any) => <h1 {...props} />,
  p: (props: any) => <p {...props} />,
  button: (props: any) => <button {...props} />,
  // Add custom components here:
  // myCustomComponent: (props) => <MyCustomComponent {...props} />,
};

export default componentMap;