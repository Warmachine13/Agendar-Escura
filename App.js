import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, PermissionsAndroid, KeyboardAvoidingView, Dimensions, FlatList, TextInput, TouchableHighlight, Image } from 'react-native';
import Contacts from "react-native-contacts";
let { width } = Dimensions.get('window');

const ItemComponent = React.memo(({ displayName,
  emailAddresses,
  hasThumbnail,
  phoneNumbers,
  thumbnailPath, load }) => {

  return (
    <View style={{ width: '100%', backgroundColor: 'black', padding: 10, borderBottomWidth: 0.3, borderBottomColor: 'lightgray' }}>


      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {
          hasThumbnail &&
          <Image style={{ width: 30, height: 30, borderRadius: 20, marginRight: 5 }} source={{ uri: thumbnailPath }} />
        }
        <View >
          <Text style={{ color: 'white' }}>Nome: {displayName}</Text>
          {emailAddresses.length > 0 && <Text style={{ color: 'white' }}>Email: {emailAddresses[0].email}</Text>}
          {phoneNumbers.length > 0 && <Text style={{ color: 'white' }}>Numero: {phoneNumbers[0].number}</Text>}
        </View>

        <TouchableHighlight onPress={() => Contacts.openExistingContact(item, _ => load())} style={{ backgroundColor: 'green', width: '15%', alignItems: 'center', alignSelf: 'flex-end' }}>
          <Text style={{ color: 'white', textAlign: 'center', paddingVertical: '25%' }}>Editar</Text>
        </TouchableHighlight>


        <TouchableHighlight onPress={_ => {
          Contacts.deleteContact(item, _ =>
            load()
          )
        }} style={{ backgroundColor: 'red', width: '15%', alignItems: 'center', alignSelf: 'flex-end' }}>
          <Text style={{ color: 'white', textAlign: 'center', paddingVertical: '25%' }}>Deletar</Text>
        </TouchableHighlight>


      </View>

    </View>
  )
})

export default class App extends Component {

  constructor(props) {
    super(props);

    this.search = this.search.bind(this);
    this.loadContacts = this.loadContacts.bind(this)

    this.state = {
      contacts: [],
      email: '',
      displayName: '',
      number: '',
    };

  }

  addContact() {
    let {
      email,
      displayName,
      number,
    } = this.state;

    let newPerson = {
      emailAddresses: [{
        label: "work",
        email,
      }],
      displayName,
      phoneNumbers: [{
        label: "mobile",
        number
      }]
    }

    Contacts.addContact(newPerson, (err) => {
      if (err) throw err;
      // save successful
      this.loadContacts();
      this.setState({ newContact: false })
    })
  }

  async componentDidMount() {
    if (Platform.OS === "android") {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: "Contacts",
        message: "This app would like to view your contacts."
      }).then(() => {

        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS, {
          title: "Contacts",
          message: "This app would like to view your contacts."
        }).then(() => {
          this.loadContacts();
        });
        this.loadContacts();
      });
    } else {
      this.loadContacts();
    }
  }

  loadContacts() {
    Contacts.getAll((err, contacts) => {
      if (err === "denied") {

        alert("Permission to access contacts was denied");
      } else {
        this.setState({ contacts });
        //   this.forceUpdate()
      }
    });
  }

  search(text) {
    const phoneNumberRegex = /\b[\+]?[(]?[0-9]{2,6}[)]?[-\s\.]?[-\s\/\.0-9]{3,15}\b/m;
    if (text === "" || text === null) {
      this.loadContacts();
    } else if (phoneNumberRegex.test(text)) {
      Contacts.getContactsByPhoneNumber(text, (err, contacts) => {
        this.setState({ contacts });
      });
    } else {
      Contacts.getContactsMatchingString(text, (err, contacts) => {
        this.setState({ contacts });
      });
    }
  }

  render() {
    let { contacts, newContact } = this.state;

    if (newContact)
      return (
        <KeyboardAvoidingView style={styles.container}>
          <Text style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>Novo Contato</Text>

          <TextInput style={{ ...styles.input, width: '95%' }} placeholderTextColor='white' placeholder='Nome' onChangeText={v => this.setState({ displayName: v })} />
          <TextInput keyboardType={'email-address'} style={{ ...styles.input, width: '95%' }} placeholderTextColor='white' placeholder='Email' onChangeText={v => this.setState({ email: v })} />
          <TextInput keyboardType={'number-pad'} style={{ ...styles.input, width: '95%' }} placeholderTextColor='white' placeholder='Numero' onChangeText={v => this.setState({ number: v })} />

          <TouchableHighlight onPress={_ => this.addContact()} style={{ backgroundColor: 'green', width, height: '20%', alignSelf: 'center', margin: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', paddingVertical: 20, color: 'white' }}>Adicionar Contato</Text>
          </TouchableHighlight>

          <TouchableHighlight onPress={_ => this.setState({ newContact: false })} style={{ backgroundColor: 'red', width, height: '20%', alignSelf: 'center', margin: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', paddingVertical: 20, color: 'white' }}>Cancelar</Text>
          </TouchableHighlight>

        </KeyboardAvoidingView>
      )

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput style={styles.input} placeholderTextColor='white' placeholder='Pesquisa...' onChangeText={this.search} />
          <TouchableHighlight onPress={_ => this.setState({ newContact: true })} style={{ backgroundColor: 'blue', width: '13%', height: 40, alignSelf: 'center', borderRadius: 50, margin: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', paddingVertical: 20, color: 'white' }}>+</Text>
          </TouchableHighlight>
        </View>

        <FlatList
          style={{ width: '100%' }}
          extraData={contacts}
          keyExtractor={(item, index) => `${index}`}
          data={contacts}
          renderItem={(item) => <ItemComponent {...item} load={this.loadContacts} />}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },

  input: {
    width: '80%',
    color: 'white',
    borderWidth: 0.3,
    borderRadius: 20,
    borderColor: 'red',
    marginVertical: 10
  }
});
