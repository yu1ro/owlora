import * as React from 'react';
import {Form, Grid} from 'semantic-ui-react';
import {safeDump, safeLoad} from 'js-yaml';
import CommonConfig from '../models/CommonConfig';

export interface ConfigEditorProps {
    defaultConfig: CommonConfig
    onSaveConfig: (config: CommonConfig) => void;
}

export interface ConfigEditorState {
    todoistToken: string;
    estimatedLabels: string;
    minutesToUsePerDay: number;
    minutesToUsePerSpecificDays: string;
}

export default class extends React.Component<ConfigEditorProps, ConfigEditorState> {

    state: ConfigEditorState = {
        todoistToken: this.props.defaultConfig.todoistToken,
        estimatedLabels: safeDump(this.props.defaultConfig.estimatedLabels),
        minutesToUsePerDay: this.props.defaultConfig.minutesToUsePerDay,
        minutesToUsePerSpecificDays: safeDump(this.props.defaultConfig.minutesToUsePerSpecificDays),
    };

    handleChange = (e, {name, value}) => this.setState({[name]: value});

    handleSubmit = e => this.props.onSaveConfig({
        todoistToken: this.state.todoistToken,
        estimatedLabels: safeLoad(this.state.estimatedLabels),
        minutesToUsePerDay: Number(this.state.minutesToUsePerDay),
        minutesToUsePerSpecificDays: safeLoad(this.state.minutesToUsePerSpecificDays),
    });

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Grid>
                    <Form.Field inline>
                        <label>Todoist API token</label>
                        <Form.Input type="password"
                                    name="todoistToken"
                                    value={this.state.todoistToken}
                                    onChange={this.handleChange}
                        />
                    </Form.Field>
                    <Form.Field inline>
                        <Form.TextArea name="estimatedLabels"
                                       label='estimatedLabels'
                                       placeholder='Estimated labels as yaml (key is label id)'
                                       value={this.state.estimatedLabels}
                                       onChange={this.handleChange}
                        />
                    </Form.Field>
                    <Form.Field inline>
                        <label>Minutes to use per day</label>
                        <Form.Input type="number"
                                    name="minutesToUsePerDay"
                                    value={this.state.minutesToUsePerDay}
                                    onChange={this.handleChange}
                        />
                    </Form.Field>
                    <Form.Field inline>
                        <Form.TextArea name="minutesToUsePerSpecificDays"
                                       label='minutesToUsePerSpecificDays'
                                       placeholder='Specific days as yaml (key is yyyyMMdd)'
                                       value={this.state.minutesToUsePerSpecificDays}
                                       onChange={this.handleChange}
                        />
                    </Form.Field>
                </Grid>
                <Form.Button content='Save'/>
            </Form>
        );
    }
}


const MINUTES_TO_USE_PER_SPECIFIC_DAYS = {
    20170707: 0,
    20170710: 0,
    20170713: 120,
    20170717: 0,
    20170726: 0
};