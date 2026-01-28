import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
} from '@react-email/components';

interface WelcomeTemplateProps {
  userName: string;
}

export function WelcomeTemplate({
  userName,
}: WelcomeTemplateProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f4f4f4',
          padding: '20px',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <Heading style={{ color: '#333333', textAlign: 'center' }}>
            Welcome to EventEase!
          </Heading>

          <Text
            style={{ fontSize: '16px', color: '#555555', lineHeight: '1.5' }}
          >
            Hi {userName},
          </Text>

          <Text
            style={{ fontSize: '16px', color: '#555555', lineHeight: '1.5' }}
          >
            Thank you for joining EventEase! We're excited to have you on board.
            Start exploring events and connect with others in your community.
          </Text>

          <Text
            style={{ fontSize: '16px', color: '#555555', lineHeight: '1.5' }}
          >
            If you have any questions, feel free to reach out to our support
            team.
          </Text>

          <Text
            style={{ fontSize: '16px', color: '#555555', lineHeight: '1.5' }}
          >
            Best regards,
            <br />
            The EventEase Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
