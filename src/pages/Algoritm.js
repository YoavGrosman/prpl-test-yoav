import { useState } from 'react'
import { Page, Layout } from '@shopify/polaris'

function Algoritm() {

    const [formSequence, setFormSequence] = useState('');
    const [highSequence, setHighSequence] = useState(0);

    const onChange = (e) => {
        setFormSequence(e.target.value)
    }

    const onSubmit = (event) => {
        event.preventDefault();

        const sequenceArray = formSequence.split(',').map(i => Number(i))
        let highestSequence = 0
        let currentSequence = 1

        for (var i = 1; i < sequenceArray.length; i++) {
            if (sequenceArray[i] - 1 === (sequenceArray[i - 1])) {
                currentSequence = currentSequence + 1;
                highestSequence = currentSequence > highestSequence ? currentSequence : highestSequence;
            } else {
                currentSequence = 1;
            }
        }

        setHighSequence(highestSequence)
    }

    return (
        <Page title="Algoritm test - Prpl">
            <Layout>
                <div>
                    <div>Highest Sequence: {highSequence} contiguous numbers</div>
                    <form onSubmit={onSubmit}>
                        <input type='text' style={{ width: '320px', marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem' }} placeholder="Add array of numbers separated by commas..." id="formSequence" value={formSequence}
                            onChange={onChange} />
                        <div>
                            <button type='submit'>
                                Find highest sequence
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        </Page>

    )
}

export default Algoritm
