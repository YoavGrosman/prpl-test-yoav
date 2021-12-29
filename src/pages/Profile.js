import { useState, useEffect, useCallback } from 'react'
import { getDoc, collection, updateDoc, doc } from 'firebase/firestore'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid'
import { Page, Layout, Card, Avatar, FormLayout, TextField, Heading, Form, Button, Stack, DropZone, Banner, List, Thumbnail } from '@shopify/polaris'
import { db } from '../firebase.config'
import Spinner from '../components/Spinner'
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';

function Profile() {
    const [loading, setLoading] = useState(true);
    const [changeDetails, setChangeDetails] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        company: '',
        description: '',
        imgUrl: '',
        phone: '',
        countryCode: ''
    });

    const { name, title, company, description, imgUrl, phone, countryCode } = formData;

    // Setting Dropzone configurations
    const [files, setFiles] = useState([]);
    const [rejectedFiles, setRejectedFiles] = useState([]);
    const hasError = rejectedFiles.length > 0;

    const fileUpload = !files.length && <DropZone.FileUpload />;

    const uploadedFiles = files.length > 0 && (
        <Stack vertical>
            {files.map((file, index) => (
                <Stack alignment="center" key={index}>
                    <Thumbnail
                        size="large"
                        alt={file.name}
                        source={window.URL.createObjectURL(file)}
                    />
                    <div>
                        {file.name}
                    </div>
                </Stack>
            ))}
        </Stack>
    );

    const errorMessage = hasError && (
        <Banner
            title="The following images couldn’t be uploaded:"
            status="critical"
        >
            <List type="bullet">
                {rejectedFiles.map((file, index) => (
                    <List.Item key={index}>
                        {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
                    </List.Item>
                ))}
            </List>
        </Banner>
    );
    const handleDrop = useCallback(
        (_droppedFiles, acceptedFiles, rejectedFiles) => {
            setFiles((files) => [...files, ...acceptedFiles]);
            setRejectedFiles(rejectedFiles);
        },
        [],
    );

    const onChange = (data, id) => {
        setFormData((prevState) => ({
            ...prevState,
            [id]: data
        }))
    }


    const handleSubmit = async (e) => {
        setLoading(true)
        const uploadImageToFirestore = async (image) => {
            return new Promise((resolve, reject) => {
                const fileName = `${image.name}-${uuidv4()}`

                const storage = getStorage();
                const storageRef = ref(storage, 'images' + fileName)
                const uploadTask = uploadBytesResumable(storageRef, image)

                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        reject(error)
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL)
                        });
                    }
                );
            })
        }

        const imgUrl = await Promise.all([...files].map((image) => uploadImageToFirestore(image)))
        console.log(imgUrl);
        const formDataCopy = {
            ...formData,
            imgUrl: imgUrl
        }

        const docRef = await updateDoc(doc(db, 'profiles', 'Y5JZiGK9O3se7JAMpbLP'), formDataCopy);

        setFormData(formDataCopy)
        setChangeDetails(false);
        setLoading(false)
    }

    useEffect(() => {

        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'profiles', 'Y5JZiGK9O3se7JAMpbLP');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setFormData(docSnap.data())
                }
            } catch (error) {
                console.log('error: ', error)
            }
        }

        fetchProfile();
        setLoading(false)
    }, [])

    return (
        <Page title="Profile">
            <Layout>
                <Layout.Section secondary>
                    {
                        !changeDetails &&
                        <Card sectioned>
                            <Avatar customer size="large" source={imgUrl} name="Naama" />
                            <Heading element="h1">{name}</Heading>
                            <p>
                                michal@prpl.io
                            </p>
                            <Button onClick={() => setChangeDetails(true)}>EDIT PROFILE</Button>
                        </Card>
                    }

                </Layout.Section>
                <Layout.Section>
                    <Card title="User profile" sectioned>
                        <Form onSubmit={handleSubmit}>
                            <FormLayout>
                                {
                                    changeDetails &&
                                    <Stack vertical>
                                        {errorMessage}
                                        <DropZone accept="image/*" type="image" label="add image" id="imgUrl" allowMultiple={false} onDrop={handleDrop}>
                                            {uploadedFiles}
                                            {fileUpload}
                                        </DropZone>
                                    </Stack>
                                }
                                <TextField
                                    id="title"
                                    label="Job Title"
                                    value={title}
                                    disabled={!changeDetails}
                                    onChange={onChange}
                                    autoComplete="off" />
                                <TextField
                                    id="company"
                                    label="Current company"
                                    onChange={onChange}
                                    autoComplete="off"
                                    disabled={!changeDetails}
                                    value={company}
                                />
                                <TextField
                                    id="description"
                                    label="About myself"
                                    onChange={onChange}
                                    autoComplete="off"
                                    multiline={8}
                                    disabled={!changeDetails}
                                    value={description}
                                />

                                <FormLayout.Group>
                                    <TextField
                                        id="countryCode"
                                        prefix="+"
                                        label="Country code"
                                        value={countryCode}
                                        onChange={onChange}
                                        autoComplete="off"
                                        disabled={!changeDetails}
                                    />
                                    <TextField
                                        id="phone"
                                        label="Phone"
                                        type="tel"
                                        inputMode="tel"
                                        value={phone}
                                        onChange={onChange}
                                        autoComplete="off"
                                        disabled={!changeDetails}
                                    />
                                </FormLayout.Group>

                                {
                                    changeDetails && <Button submit>UPDATE PROFILE</Button>
                                }
                            </FormLayout>
                        </Form>
                    </Card>
                </Layout.Section>
            </Layout>
            {loading && <Spinner />}
        </Page>
    )
}

export default Profile
