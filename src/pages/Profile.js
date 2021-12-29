import { useState, useEffect, useCallback } from 'react'
import { getDoc, collection, updateDoc, doc } from 'firebase/firestore'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-toastify'
import { Page, Layout, Card, Avatar, FormLayout, TextField, Heading, Form, Button, Stack, DropZone, Banner, List, Thumbnail } from '@shopify/polaris'
import { db } from '../firebase.config'
import Spinner from '../components/Spinner'

function Profile() {
    // Initializing State
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

    // Setting Dropzone configurations - Polaris documentation
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

        // Validate phone numbers
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        const countryCodeRegex = /^(\+?\d{1,3}|\d{1,4})$/gm;

        const isPhoneValid = phone.match(phoneRegex);
        const isCountryCodeValid = countryCode.match(countryCodeRegex);

        if (!isPhoneValid || !isCountryCodeValid) {
            toast.error('Something wrong with the phone number you added');
            setLoading(false)
            return
        }

        // Async function to upload user image to Firestore and get new image URL
        const uploadImageToFirestore = async (image) => {
            return new Promise((resolve, reject) => {
                const fileName = `${image.name}-${uuidv4()}`
                const storage = getStorage();
                const storageRef = ref(storage, 'images' + fileName)
                const uploadTask = uploadBytesResumable(storageRef, image)

                uploadTask.on('state_changed',
                    (snapshot) => {
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
                        // After upload is complete - return image URL
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL)
                        });
                    }
                );
            })
        }

        let newImgUrl = imgUrl;

        if (files.length > 0) {
            newImgUrl = await Promise.all([...files].map((image) => uploadImageToFirestore(image)))
        }

        const formDataCopy = {
            ...formData,
            imgUrl: newImgUrl
        }

        // Update db with new info
        const docRef = await updateDoc(doc(db, 'profiles', 'Y5JZiGK9O3se7JAMpbLP'), formDataCopy);

        // Set State
        setFormData(formDataCopy);
        setChangeDetails(false);
        setLoading(false);
        setFiles([]);
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
                                    <>
                                        <Stack vertical>
                                            {errorMessage}
                                            <DropZone accept="image/*" type="image" id="newImgUrl" allowMultiple={false} onDrop={handleDrop}>
                                                {uploadedFiles}
                                                {fileUpload}
                                            </DropZone>
                                        </Stack>
                                    </>

                                }
                                <TextField
                                    id="title"
                                    label="Job Title"
                                    max="number"
                                    maxLength={20}
                                    value={title}
                                    disabled={!changeDetails}
                                    onChange={onChange}
                                    autoComplete="off" />
                                <TextField
                                    id="company"
                                    label="Current company"
                                    max="number"
                                    maxLength={20}
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
